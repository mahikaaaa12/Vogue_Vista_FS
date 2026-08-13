"""
Pose landmark extraction using MediaPipe Pose.

Returns:
    landmarks: dict[name] = {x, y, z, visibility} in normalized [0,1] coords.
    raw:       list of 33 dicts (full MediaPipe topology) for storage.
    mask:      person segmentation mask, when MediaPipe provides one.

We do NOT hardcode body-shape thresholds here — this module only produces
geometric landmarks. Downstream `features.py` derives proportional
measurements, and `classifier.py` does the ML-based shape prediction.
"""
from __future__ import annotations
from ml_service.image_models.feature_extraction.landmarks import extract
from ml_service.shared.exceptions import PreprocessingError as PoseExtractionError