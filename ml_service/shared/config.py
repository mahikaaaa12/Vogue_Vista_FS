"""
ml_service.shared.config

Centralized Configuration Module for Vogue Vista ML Service.
Holds all model paths, image sizes, thresholds, confidence defaults, and hardware preferences.
"""

import os
from pathlib import Path

# Base Paths
ML_SERVICE_ROOT = Path(__file__).resolve().parent.parent
PROJECT_ROOT = ML_SERVICE_ROOT.parent

# Models Directory Paths
MODELS_DIR = ML_SERVICE_ROOT / "models"
MEASUREMENT_MODELS_DIR = MODELS_DIR / "measurement"
IMAGE_MODELS_DIR = MODELS_DIR / "image"

# Ensure Model Directories Exist
MEASUREMENT_MODELS_DIR.mkdir(parents=True, exist_ok=True)
IMAGE_MODELS_DIR.mkdir(parents=True, exist_ok=True)


class MLConfig:
    """Centralized Configuration Constants and Preferences."""

    # Measurement Model Paths
    SHAPE_CLASSIFIER_PATH = MEASUREMENT_MODELS_DIR / "shape_classifier.joblib"
    FEMALE_CLASSIFIER_PATH = MEASUREMENT_MODELS_DIR / "female_classifier.joblib"
    MALE_CLASSIFIER_PATH = MEASUREMENT_MODELS_DIR / "male_classifier.joblib"
    BEST_BODYSHAPE_CLASSIFIER_PATH = MEASUREMENT_MODELS_DIR / "best_bodyshape_classifier.joblib"
    SCALER_PATH = MEASUREMENT_MODELS_DIR / "scaler.pkl"
    GENDER_ENCODER_PATH = MEASUREMENT_MODELS_DIR / "gender_encoder.pkl"
    SHAPE_ENCODER_PATH = MEASUREMENT_MODELS_DIR / "shape_encoder.pkl"

    # Image Model Paths
    FEMALE_MODEL_PTH = IMAGE_MODELS_DIR / "best_multimodal_model.pth"
    FEMALE_MODEL_PT = IMAGE_MODELS_DIR / "multimodal_body_shape_predictor.pt"
    FEMALE_MODEL_ONNX = IMAGE_MODELS_DIR / "multimodal_body_shape_predictor.onnx"
    MALE_MODEL_PTH = IMAGE_MODELS_DIR / "best_male_bodyshape_model.pth"
    BASELINE_FEMALE_MODEL_PTH = IMAGE_MODELS_DIR / "best_female_bodyshape_model.pth"
    SILHOUETTE_FEMALE_MODEL_PTH = IMAGE_MODELS_DIR / "best_silhouette_female_bodyshape_model.pth"

    # Image Preprocessing & Inference Defaults
    IMAGE_SIZE = (640, 640)
    INPUT_CHANNELS = 3
    CONFIDENCE_THRESHOLD = 0.50
    DEFAULT_DEVICE = "cuda"  # Auto-falls back to CPU if unavailable

    # MediaPipe Parameters
    MEDIAPIPE_MIN_DETECTION_CONFIDENCE = 0.5
    MEDIAPIPE_MIN_TRACKING_CONFIDENCE = 0.5
    MEDIAPIPE_MODEL_COMPLEXITY = 1

    # Color & Undertone Analysis Defaults
    COLOR_SEASON_CLASSES = ["Spring", "Summer", "Autumn", "Winter"]
    UNDERTONE_CLASSES = ["Warm", "Cool", "Neutral"]
