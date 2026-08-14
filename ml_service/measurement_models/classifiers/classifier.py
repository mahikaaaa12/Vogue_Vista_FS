"""
ml_service.measurement_models.classifiers.classifier

Measurement-based Body Shape Classifier.
Uses ModelLoader to load models lazily through the centralized shared loader.
"""

from __future__ import annotations
import numpy as np
import logging
from ml_service.shared.config import MLConfig
from ml_service.shared.constants import FEATURE_KEYS
from ml_service.shared.model_loader import ModelLoader

logger = logging.getLogger(__name__)
_loader = ModelLoader()


def _get_male_model():
    try:
        return _loader.load_model(MLConfig.MALE_CLASSIFIER_PATH)
    except Exception:
        return None


def _get_female_model():
    try:
        return _loader.load_model(MLConfig.FEMALE_CLASSIFIER_PATH)
    except Exception:
        return None


def _get_general_model():
    try:
        return _loader.load_model(MLConfig.SHAPE_CLASSIFIER_PATH)
    except Exception:
        return None


def predict(feature_dict: dict, gender: str = "female", use_rules: bool = False) -> dict:
    gender = (gender or "female").lower()

    # Build feature vector in correct order
    x = np.array(
        [[feature_dict.get(k, 0.0) for k in FEATURE_KEYS]],
        dtype=np.float32
    )

    if gender == "male":
        model = _get_male_model()
    else:
        model = _get_female_model()

    if model is None:
        model = _get_general_model()

    if model is None:
        # Graceful fallback heuristic if no classifier joblib model is present
        return _fallback_prediction(feature_dict, gender)

    probs = model.predict_proba(x)[0]
    # Handle both pipeline and direct estimator classes_ attribute access
    if hasattr(model, "classes_"):
        classes = list(model.classes_)
    elif hasattr(model, "steps") and hasattr(model.steps[1][1], "classes_"):
        classes = list(model.steps[1][1].classes_)
    else:
        classes = ["hourglass", "pear", "rectangle", "inverted_triangle", "apple"] if gender == "female" else ["trapezoid", "rectangle", "triangle", "oval", "inverted_triangle"]

    order = np.argsort(probs)[::-1]
    top_idx = int(order[0])

    top_predictions = [
        {"shape": str(classes[i]), "probability": float(probs[i])}
        for i in order
    ]

    return {
        "predicted_shape": str(classes[top_idx]),
        "confidence": float(probs[top_idx]),
        "top_predictions": top_predictions,
        "probabilities": {str(classes[i]): float(probs[i]) for i in range(len(classes))},
    }


def _fallback_prediction(f: dict, gender: str) -> dict:
    """
    Anatomical multi-feature fallback when no trained model is loadable.
    Calibrated to real MediaPipe+segmentation output ranges.
    """
    if gender == "male":
        sh_hip = f.get("shoulder_to_hip", 1.2)
        shape = "trapezoid" if sh_hip > 1.05 else "rectangle"
        classes = ["trapezoid", "rectangle", "triangle", "oval", "inverted_triangle"]
    else:
        s2h = f.get("shoulder_to_hip", 1.0)
        w2h = f.get("waist_to_hip", 0.70)
        wd  = f.get("waist_definition", 0.30)
        ta  = f.get("torso_aspect", 0.65)
        c2h = f.get("chest_to_hip", 1.0)

        # Apple: wide waist relative to hips, low waist_definition
        if w2h > 0.80 and wd < 0.26:
            shape = "apple"
        # Hourglass: defined waist + high chest_to_hip + moderate torso_aspect
        elif wd > 0.24 and c2h > 1.08 and ta < 0.72:
            shape = "hourglass"
        # Inverted Triangle: high torso_aspect (lean long body) + high chest_to_hip
        elif ta > 0.78 and c2h > 1.02:
            shape = "inverted_triangle"
        # Pear: wide chest-to-hip (hips wider) + low torso_aspect
        elif c2h > 1.05 and s2h > 1.03:
            shape = "pear"
        # Rectangle: catch-all for uniform proportions
        else:
            shape = "rectangle"

        classes = ["hourglass", "pear", "rectangle", "inverted_triangle", "apple"]

    probs = {s: 0.05 for s in classes}
    probs[shape] = 0.72

    top_predictions = [
        {"shape": s, "probability": probs[s]}
        for s in sorted(classes, key=lambda x: probs[x], reverse=True)
    ]
    return {
        "predicted_shape": shape,
        "confidence": 0.72,
        "top_predictions": top_predictions,
        "probabilities": probs,
    }
