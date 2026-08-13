"""
Body shape classifier for manual measurement input.

Bridges Django view requests to the centralized ML service classifier.
Uses ModelLoader to load models lazily to avoid server startup issues on Windows.
"""

from __future__ import annotations
import numpy as np
import logging
from ml_service.shared.exceptions import ModelNotTrainedError
from ml_service.shared.model_loader import ModelLoader
from ml_service.shared.config import MLConfig

logger = logging.getLogger(__name__)
_loader = ModelLoader()

FEATURE_KEYS = [
    "shoulder_to_hip",
    "waist_to_hip",
    "shoulder_to_waist",
    "chest_to_hip",
    "torso_aspect",
    "symmetry",
    "midline_offset",
    "waist_definition",
]


def predict(feature_dict: dict, gender: str, use_rules: bool = False) -> dict:
    gender = (gender or "female").lower()

    # Build feature vector in correct order
    x = np.array(
        [[feature_dict.get(k, 0.0) for k in FEATURE_KEYS]],
        dtype=np.float32
    )

    # Lazy-load the model
    if gender == "male":
        model_path = MLConfig.MALE_CLASSIFIER_PATH
    else:
        model_path = MLConfig.FEMALE_CLASSIFIER_PATH

    model = None
    try:
        model = _loader.load_model(model_path)
    except Exception as e:
        logger.warning("Failed to load model %s: %s", model_path, e)

    if model is None:
        # Fallback to general model or heuristic
        logger.warning("Using fallback heuristic for prediction")
        sh_hip = feature_dict.get("shoulder_to_hip", 1.0)
        if gender == "male":
            shape = "trapezoid" if sh_hip > 1.05 else "rectangle"
        else:
            shape = "hourglass" if sh_hip > 0.98 else "pear"
        classes = ["hourglass", "pear", "rectangle", "inverted_triangle", "apple"] if gender == "female" else ["trapezoid", "rectangle", "triangle", "oval", "inverted_triangle"]
        probs = {s: 0.20 for s in classes}
        probs[shape] = 0.75
        return {
            "label": shape,
            "confidence": 0.75,
            "probabilities": probs,
        }

    probs = model.predict_proba(x)[0]
    classes = list(model.steps[1][1].classes_)
    
    order = np.argsort(probs)[::-1]
    top_idx = int(order[0])

    return {
        "label": str(classes[top_idx]),
        "confidence": float(probs[top_idx]),
        "probabilities": {
            str(classes[i]): float(probs[i])
            for i in range(len(classes))
        },
    }
