"""
ml_service.image_models.color_analysis.color_season

Seasonal Color Analysis Module.
"""

from typing import Dict, Any


def analyze_color_season(skin_rgb: tuple, hair_rgb: tuple, eye_rgb: tuple) -> Dict[str, Any]:
    """Determines seasonal color palette based on facial RGB samples."""
    r, g, b = skin_rgb
    luminance = 0.299 * r + 0.587 * g + 0.114 * b
    is_warm = (r - g) > (g - b)

    if is_warm:
        season = "Spring" if luminance > 128 else "Autumn"
    else:
        season = "Summer" if luminance > 128 else "Winter"

    return {
        "season": season,
        "undertone": "Warm" if is_warm else "Cool",
        "luminance": round(luminance, 2),
        "palette": ["Coral", "Warm Gold", "Peach"] if is_warm else ["Navy", "Emerald", "Cool Berry"]
    }
