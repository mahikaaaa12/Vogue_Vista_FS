"""
ml_service.image_models.preprocessing.image_transforms

Standardized Image Preprocessing and Transformation Pipelines.
"""

import numpy as np
import cv2
from PIL import Image
import torch
from torchvision import transforms as T
from ml_service.shared.config import MLConfig


def get_eval_transforms():
    """Standardized PyTorch Image Evaluation Transforms."""
    return T.Compose([
        T.Resize(MLConfig.IMAGE_SIZE),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])


def load_and_preprocess_image(image_input) -> tuple[Image.Image, np.ndarray]:
    """Decodes image input into PIL Image and BGR numpy array."""
    if isinstance(image_input, (str, Image.Image)):
        if isinstance(image_input, str):
            img_pil = Image.open(image_input).convert("RGB")
        else:
            img_pil = image_input.convert("RGB")
        img_bgr = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
    elif isinstance(image_input, bytes):
        nparr = np.frombuffer(image_input, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            raise ValueError("Failed to decode image bytes.")
        img_pil = Image.fromarray(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB))
    elif isinstance(image_input, np.ndarray):
        img_bgr = image_input
        img_pil = Image.fromarray(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB))
    else:
        raise ValueError(f"Unsupported image input type: {type(image_input)}")

    return img_pil, img_bgr
