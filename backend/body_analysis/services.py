"""
Service layer — keeps views thin and pipeline reusable from Celery tasks.
"""
from __future__ import annotations
import logging
from django.db import transaction
from .models import BodyAnalysis
from .ml.pipeline import run as run_pipeline, PipelineError

logger = logging.getLogger(__name__)

def analyze_for_user(user, image_file) -> BodyAnalysis:
    """Synchronous analysis: persist record, run pipeline, store results."""
    record = BodyAnalysis.objects.create(user=user, image=image_file, status="pending")
    try:
        result = run_pipeline(record.image.path)
        with transaction.atomic():
            record.landmarks       = result["landmarks"]
            record.measurements    = result["measurements"]
            record.features        = result["features"]
            record.predicted_shape = result["predicted_shape"]
            record.confidence      = result["confidence"]
            record.probabilities   = result["probabilities"]
            record.processing_ms   = result["processing_ms"]
            record.status          = "done"
            record.save()
    except PipelineError as e:
        record.status = "failed"
        record.error  = str(e)
        record.save(update_fields=["status", "error"])
        logger.warning("Analysis %s failed: %s", record.id, e)
    return record


# Lazy-loaded singleton predictor for body shape
_predictor = None

def _get_predictor():
    global _predictor
    if _predictor is None:
        from .ml.predictor import BodyShapePredictor
        _predictor = BodyShapePredictor()
    return _predictor

def predict_body_shape(features: dict) -> dict:
    """
    Predicts body shape from a dictionary of measurements or ratios.
    Accepts:
      - Absolute measurements: {"gender", "shoulder", "waist", "hip", "torso", "symmetry" (opt), "midline_offset" (opt)}
      - Or directly calculated ratios: {"gender", "shoulder_to_hip", "waist_to_hip", "shoulder_to_waist", "torso_aspect", "symmetry" (opt), "midline_offset" (opt)}
    
    Returns:
      dict matching:
      {
          "body_shape": "...",
          "confidence": ...,
          "top_predictions": [...]
      }
    """
    predictor = _get_predictor()
    
    gender = features.get("gender")
    if gender is None:
        raise ValueError("Missing required key 'gender' in features dictionary.")
        
    if "shoulder_to_hip" in features:
        # Directly extract scale-invariant ratios
        shoulder_to_hip = features.get("shoulder_to_hip")
        waist_to_hip = features.get("waist_to_hip")
        shoulder_to_waist = features.get("shoulder_to_waist")
        torso_aspect = features.get("torso_aspect")
        symmetry = features.get("symmetry", 1.0)
        midline_offset = features.get("midline_offset", 0.0)
    else:
        # Calculate ratios from absolute measurements
        shoulder = features.get("shoulder")
        waist = features.get("waist")
        hip = features.get("hip")
        torso = features.get("torso")
        
        if None in (shoulder, waist, hip, torso):
            raise ValueError(
                "Missing required measurements. Must provide either direct ratios or "
                "absolute values for 'shoulder', 'waist', 'hip', and 'torso'."
            )
            
        symmetry = features.get("symmetry", 1.0)
        midline_offset = features.get("midline_offset", 0.0)
        
        from .ml.features import calculate_ratios
        ratios = calculate_ratios(
            float(shoulder), float(waist), float(hip), float(torso),
            symmetry=float(symmetry), midline_offset=float(midline_offset)
        )
        shoulder_to_hip = ratios["shoulder_to_hip"]
        waist_to_hip = ratios["waist_to_hip"]
        shoulder_to_waist = ratios["shoulder_to_waist"]
        torso_aspect = ratios["torso_aspect"]
        symmetry = ratios["symmetry"]
        midline_offset = ratios["midline_offset"]

    # Run predictions
    pred_res = predictor.predict(
        gender=gender,
        shoulder_to_hip=shoulder_to_hip,
        waist_to_hip=waist_to_hip,
        shoulder_to_waist=shoulder_to_waist,
        torso_aspect=torso_aspect,
        symmetry=symmetry,
        midline_offset=midline_offset
    )
    
    return {
        "body_shape": pred_res["predicted_shape"],
        "confidence": pred_res["confidence"],
        "top_predictions": pred_res["top_3"]
    }


class BodyAnalysisService:
    @staticmethod
    def calculate_shape(bust, waist, hip, gender='female'):
        gender = (gender or 'female').lower()
        if bust <= 0 or waist <= 0 or hip <= 0:
            if gender == 'male':
                return "Trapezoid", 0.95, ["Structured blazers", "Tailored trousers", "Crew neck sweaters"]
            else:
                return "Hourglass", 0.95, ["Fitted waists", "Wrap silhouettes", "V-necklines"]

        ratio_bw = bust / waist if waist > 0 else 1.0
        ratio_hw = hip / waist if waist > 0 else 1.0
        ratio_bh = bust / hip if hip > 0 else 1.0

        if gender == 'male':
            # Male body shape rules: Trapezoid, Inverted Triangle, Triangle, Oval, Rectangle
            if ratio_bh >= 1.15 and ratio_bw >= 1.20:
                shape = "Inverted Triangle"
                recs = ["V-neck t-shirts", "Relaxed-fit jeans", "Unstructured soft blazers"]
            elif ratio_bh >= 1.05 and ratio_bw >= 1.10:
                shape = "Trapezoid"
                recs = ["Tailored blazers", "Slim-fit jeans", "Fitted polo shirts"]
            elif ratio_bh < 0.95 and ratio_hw >= 1.05:
                shape = "Triangle"
                recs = ["Structured shoulder jackets", "Straight-leg pants", "Layered outerwear"]
            elif ratio_bw < 1.05 and ratio_hw < 1.05 and waist > (bust * 0.92):
                shape = "Oval"
                recs = ["Vertical stripe shirts", "Single-breasted jackets", "Straight-leg trousers"]
            else:
                shape = "Rectangle"
                recs = ["Layered knitwear", "Structured field coats", "Pleated chinos"]
        else:
            # Female body shape rules: Hourglass, Pear, Inverted Triangle, Rectangle, Apple
            if ratio_bw >= 1.25 and ratio_hw >= 1.25:
                shape = "Hourglass"
                recs = ["High-waisted skirts", "Belted coats", "Wrap dresses"]
            elif ratio_hw >= 1.25 and ratio_bh < 0.95:
                shape = "Pear"
                recs = ["A-line skirts", "Statement tops", "Boat necklines"]
            elif ratio_bw >= 1.25 and ratio_bh >= 1.05:
                shape = "Inverted Triangle"
                recs = ["Wide-leg trousers", "Peplum tops", "V-neck jackets"]
            elif ratio_bw < 1.15 and ratio_hw < 1.15:
                shape = "Rectangle"
                recs = ["Ruched dresses", "Cropped jackets", "Pleated skirts"]
            else:
                shape = "Apple"
                recs = ["Empire waists", "Flowy tunics", "Structured blazers"]

        return shape, 0.96, recs
