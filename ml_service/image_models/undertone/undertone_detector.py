"""
ml_service.image_models.undertone.undertone_detector

Undertone Detection Module.
"""

from typing import Dict, Any


def detect_undertone(skin_rgb: tuple) -> Dict[str, Any]:
    """Detects skin undertone (Warm, Cool, Neutral)."""
    r, g, b = skin_rgb
    rg_diff = r - g
    gb_diff = g - b

    if abs(rg_diff - gb_diff) < 5:
        undertone = "Neutral"
    elif rg_diff > gb_diff:
        undertone = "Warm"
    else:
        undertone = "Cool"

    return {
        "undertone": undertone,
        "confidence": 0.88,
        "sample_rgb": list(skin_rgb)
    }
