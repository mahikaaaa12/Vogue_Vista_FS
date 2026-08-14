"""
End-to-end inference pipeline.

    bytes/file → preprocess → landmarks → features → classifier → result

Each stage is independently testable and replaceable (e.g. swap
MediaPipe for Detectron2 by editing `landmarks.py` only).
"""
from __future__ import annotations
import time
import logging

from ml_service.image_models.feature_extraction import landmarks as lm_mod
from ml_service.measurement_models.feature_engineering import features as feat_mod
from ml_service.measurement_models.classifiers import classifier
from ml_service.image_models.preprocessing import image_transforms
from ml_service.shared.exceptions import PreprocessingError, ModelNotTrainedError
from . import preprocessing

logger = logging.getLogger(__name__)

class PipelineError(Exception):
    pass

def run(file_obj, gender="female") -> dict:
    t0 = time.perf_counter()
    try:
        img = preprocessing.preprocess(file_obj)
        extracted = lm_mod.extract(img)
        if len(extracted) == 3:
            named, raw, segmentation_mask = extracted
        else:
            named, raw = extracted
            segmentation_mask = None
        derived = feat_mod.derive(named, segmentation_mask=segmentation_mask)
        prediction = classifier.predict(derived, gender=gender)
    except PreprocessingError as e:
        raise PipelineError(str(e))
    except ModelNotTrainedError as e:
        raise PipelineError(str(e))
    except Exception as e:
        logger.exception("Unexpected pipeline failure")
        raise PipelineError(f"Analysis failed: {e}")

    elapsed_ms = int((time.perf_counter() - t0) * 1000)
    return {
        "landmarks": raw,
        "measurements": {
            "shoulder_width": derived["shoulder_width"],
            "waist_width": derived["waist_width"],
            "hip_width": derived["hip_width"],
            "torso_height": derived["torso_height"],
            "waist_definition": derived["waist_definition"],
            "landmark_confidence": derived["landmark_confidence"],
        },
        "features": {
            "shoulder_to_hip": derived["shoulder_to_hip"],
            "waist_to_hip": derived["waist_to_hip"],
            "shoulder_to_waist": derived["shoulder_to_waist"],
            "chest_to_hip": derived.get("chest_to_hip", 0.0),
            "waist_definition": derived["waist_definition"],
            "torso_aspect": derived["torso_aspect"],
            "symmetry": derived["symmetry"],
            "midline_offset": derived["midline_offset"],
            "avg_visibility": derived["landmark_confidence"],
        },
        "predicted_shape": prediction["predicted_shape"],
        "confidence": prediction["confidence"],
        "probabilities": prediction["probabilities"],
        "processing_ms": elapsed_ms,
    }