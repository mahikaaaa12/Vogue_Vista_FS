"""
ml_service.shared.model_loader

Centralized Thread-Safe Model Loader for Vogue Vista ML Service.

Supported formats:
- Scikit-learn / Joblib (.joblib, .pkl)
- PyTorch State Dict / TorchScript (.pth, .pt)
- ONNX Runtime (.onnx)

No file should directly call joblib.load(), pickle.load(), or torch.load().
All models MUST be loaded through ModelLoader.load_model(...).
"""

import os
from pathlib import Path
import threading
from typing import Any, Union, Optional
import joblib
import pickle
import torch

from .logger import get_logger
from .exceptions import ModelLoadError, ModelNotTrainedError
from .cache import MLCache

logger = get_logger("ModelLoader")


class ModelLoader:
    """Thread-safe Singleton Model Loader with automatic device detection and caching."""
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._cache = MLCache()
                cls._instance._device = "cuda" if torch.cuda.is_available() else "cpu"
                logger.info("Initialized ModelLoader on device: %s", cls._instance._device)
        return cls._instance

    @property
    def device(self) -> str:
        return self._device

    def load_model(
        self,
        model_path: Union[str, Path],
        model_type: Optional[str] = None,
        map_to_device: bool = True
    ) -> Any:
        """
        Loads and caches a model artifact.

        :param model_path: Absolute or relative path to the model file.
        :param model_type: Explicit type ('joblib', 'pickle', 'pytorch', 'torchscript', 'onnx').
                           If None, inferred from file extension.
        :param map_to_device: Whether to map PyTorch models to self.device.
        :return: Loaded model object.
        """
        path = Path(model_path).resolve()
        if not path.exists():
            raise ModelNotTrainedError(f"Model file does not exist: {path}")

        mtime = path.stat().st_mtime
        cache_key = str(path)

        if self._cache.is_fresh(cache_key, mtime):
            return self._cache.get(cache_key)

        with self._lock:
            # Double check after lock
            if self._cache.is_fresh(cache_key, mtime):
                return self._cache.get(cache_key)

            logger.info("Loading model from: %s", path)
            ext = path.suffix.lower()

            if model_type is None:
                if ext in {".joblib"}:
                    model_type = "joblib"
                elif ext in {".pkl"}:
                    model_type = "pickle"
                elif ext in {".pth", ".pt"}:
                    model_type = "pytorch"
                elif ext in {".onnx"}:
                    model_type = "onnx"
                else:
                    raise ModelLoadError(f"Unsupported model extension: {ext}")

            try:
                if model_type == "joblib":
                    model = joblib.load(path)
                elif model_type == "pickle":
                    with open(path, "rb") as f:
                        model = pickle.load(f)
                elif model_type in {"pytorch", "torchscript"}:
                    device = self._device if map_to_device else "cpu"
                    try:
                        # Try loading state dict or model object
                        model = torch.load(path, map_location=device)
                    except Exception:
                        # Try torch.jit.load for TorchScript
                        model = torch.jit.load(str(path), map_location=device)
                elif model_type == "onnx":
                    import onnxruntime as ort
                    model = ort.InferenceSession(str(path))
                else:
                    raise ModelLoadError(f"Unknown model type: {model_type}")

                self._cache.set(cache_key, model, mtime)
                logger.info("Successfully loaded and cached %s model: %s", model_type, path.name)
                return model

            except Exception as err:
                raise ModelLoadError(f"Failed to load model from {path}: {str(err)}") from err
