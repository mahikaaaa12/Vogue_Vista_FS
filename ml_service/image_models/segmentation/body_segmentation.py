"""
ml_service.image_models.segmentation.body_segmentation

Body Segmentation and Mask Extraction Module.
"""

import numpy as np
import cv2


def extract_person_mask(img_bgr: np.ndarray) -> np.ndarray:
    """Extracts foreground person binary mask using Otsu thresholding and GrabCut."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, bin_mask = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    if np.mean(bin_mask[:10, :10]) > 128:
        bin_mask = cv2.bitwise_not(bin_mask)

    return bin_mask
