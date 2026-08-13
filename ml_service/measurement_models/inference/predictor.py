"""
ml_service.measurement_models.inference.predictor

High-level Body Shape Predictor class wrapping measurement-based ML inference.
"""

from ml_service.measurement_models.classifiers.classifier import predict as predict_measurement_shape


class BodyShapePredictor:
    """Predicts body shape from raw numerical measurements or ratio feature dictionaries."""

    def predict(self, feature_dict: dict) -> dict:
        gender = str(feature_dict.get("gender", "female")).lower()

        # If raw measurements provided, calculate ratios
        if "shoulder_to_hip" not in feature_dict and "shoulder" in feature_dict:
            sw = float(feature_dict.get("shoulder", 1.0))
            hw = float(feature_dict.get("hip", 1.0))
            ww = float(feature_dict.get("waist", 1.0))
            th = float(feature_dict.get("torso", 1.0))
            eps = 1e-6
            feature_dict = {
                "gender": gender,
                "shoulder_to_hip": sw / (hw + eps),
                "waist_to_hip": ww / (hw + eps),
                "shoulder_to_waist": sw / (ww + eps),
                "torso_aspect": th / (max(sw, hw) + eps),
                "symmetry": float(feature_dict.get("symmetry", 1.0)),
                "midline_offset": float(feature_dict.get("midline_offset", 0.0))
            }

        res = predict_measurement_shape(feature_dict, gender=gender, use_rules=True)
        return {
            "body_shape": res["predicted_shape"],
            "confidence": res["confidence"],
            "top_predictions": res["top_predictions"]
        }
