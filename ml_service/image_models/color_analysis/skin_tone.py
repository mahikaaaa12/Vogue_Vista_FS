"""
ml_service.image_models.color_analysis.skin_tone

Skin Tone Extraction Module.
"""

import numpy as np


def extract_skin_tone(face_crop_rgb: np.ndarray) -> dict:
    """Extracts average skin tone RGB and ITA (Individual Typology Angle)."""
    mean_rgb = np.mean(face_crop_rgb, axis=(0, 1))
    r, g, b = mean_rgb[0], mean_rgb[1], mean_rgb[2]
    luminance = 0.299 * r + 0.587 * g + 0.114 * b

    return {
        "rgb": [int(r), int(g), int(b)],
        "luminance": round(float(luminance), 2),
        "hex": f"#{int(r):02x}{int(g):02x}{int(b):02x}"
    }
