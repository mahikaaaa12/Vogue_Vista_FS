"""
ml_service.image_models.utils.image_utils

General Image Processing Utilities.
"""

import numpy as np
import cv2


def resize_aspect_ratio(img: np.ndarray, target_size: tuple = (640, 640)) -> np.ndarray:
    """Resizes an image preserving aspect ratio with letterboxing."""
    h, w = img.shape[:2]
    th, tw = target_size
    scale = min(tw / w, th / h)
    nw, nh = int(w * scale), int(h * scale)

    resized = cv2.resize(img, (nw, nh), interpolation=cv2.INTER_AREA)
    canvas = np.zeros((th, tw, 3), dtype=np.uint8)

    dx = (tw - nw) // 2
    dy = (th - nh) // 2
    canvas[dy:dy + nh, dx:dx + nw] = resized
    return canvas
