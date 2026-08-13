"""
Geometric feature extraction.

Wrapper delegating to the unified ml_service implementation.
"""
from __future__ import annotations
import numpy as np
from ml_service.measurement_models.feature_engineering.features import derive, calculate_ratios

FEATURE_KEYS = [
    "shoulder_to_hip",
    "waist_to_hip",
    "shoulder_to_waist",
    "torso_aspect",
    "symmetry",
    "midline_offset",
]

def build_features(landmarks: dict, segmentation_mask=None) -> dict:
    res = derive(landmarks, segmentation_mask)
    return {
        "measurements": {
            "shoulder_width": res["shoulder_width"],
            "waist_width": res["waist_width"],
            "hip_width": res["hip_width"],
            "torso_height": res["torso_height"],
            "waist_definition": res["waist_definition"],
            "landmark_confidence": res["landmark_confidence"],
        },
        "features": {
            "shoulder_to_hip": res["shoulder_to_hip"],
            "waist_to_hip": res["waist_to_hip"],
            "shoulder_to_waist": res["shoulder_to_waist"],
            "torso_aspect": res["torso_aspect"],
            "symmetry": res["symmetry"],
            "midline_offset": res["midline_offset"],
        }
    }

def feature_vector(features: dict) -> np.ndarray:
    """Stable ordering for ML input."""
    return np.array([features[k] for k in FEATURE_KEYS], dtype=np.float32)