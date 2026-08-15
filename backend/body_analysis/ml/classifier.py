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
    "waist_definition",
    "torso_aspect",
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
        logger.warning("Using fallback heuristic for %s prediction", gender)
        if gender == "male":
            s2h = feature_dict.get("shoulder_to_hip", 1.15)
            w2h = feature_dict.get("waist_to_hip", 0.85)
            wd  = feature_dict.get("waist_definition", 0.20)
            c2h = feature_dict.get("chest_to_hip", 1.15)

            if s2h > 1.22 and w2h < 0.75:
                shape = "inverted_triangle"
            elif s2h < 1.05 and w2h > 0.88:
                shape = "triangle"
            elif w2h > 0.92 and wd < 0.18:
                shape = "oval"
            elif s2h > 1.15 and c2h > 1.10:
                shape = "trapezoid"
            else:
                shape = "rectangle"
            classes = ["trapezoid", "rectangle", "triangle", "oval", "inverted_triangle"]
        else:
            s2h = feature_dict.get("shoulder_to_hip", 1.0)
            w2h = feature_dict.get("waist_to_hip", 0.70)
            wd  = feature_dict.get("waist_definition", 0.30)
            ta  = feature_dict.get("torso_aspect", 0.65)
            c2h = feature_dict.get("chest_to_hip", 1.0)

            if w2h > 0.80 and wd < 0.26:
                shape = "apple"
            elif wd > 0.24 and c2h > 1.08 and ta < 0.72:
                shape = "hourglass"
            elif ta > 0.78 and c2h > 1.02:
                shape = "inverted_triangle"
            elif c2h > 1.05 and s2h > 1.03:
                shape = "pear"
            else:
                shape = "rectangle"
            classes = ["hourglass", "pear", "rectangle", "inverted_triangle", "apple"]

        probs = {s: 0.05 for s in classes}
        probs[shape] = 0.75
        return {
            "label": shape,
            "confidence": 0.75,
            "probabilities": probs,
        }

    probs = model.predict_proba(x)[0]
    if hasattr(model, "classes_"):
        classes = list(model.classes_)
    elif hasattr(model, "steps") and hasattr(model.steps[-1][1], "classes_"):
        classes = list(model.steps[-1][1].classes_)
    elif hasattr(model, "steps") and hasattr(model.steps[1][1], "classes_"):
        classes = list(model.steps[1][1].classes_)
    else:
        classes = ["hourglass", "pear", "rectangle", "inverted_triangle", "apple"] if gender == "female" else ["trapezoid", "rectangle", "triangle", "oval", "inverted_triangle"]
    
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
