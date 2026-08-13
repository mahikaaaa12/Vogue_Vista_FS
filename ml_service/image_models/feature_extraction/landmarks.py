from __future__ import annotations
import os
import numpy as np

import google.protobuf.descriptor
import google.protobuf.symbol_database
import google.protobuf.message_factory

if not hasattr(google.protobuf.descriptor.FieldDescriptor, 'label'):
    try:
        google.protobuf.descriptor.FieldDescriptor.label = property(lambda self: getattr(self, '_label', 1))
    except Exception:
        pass

try:
    import google._upb._message
    if hasattr(google._upb._message, 'FieldDescriptor') and not hasattr(google._upb._message.FieldDescriptor, 'label'):
        google._upb._message.FieldDescriptor.label = property(lambda self: getattr(self, '_label', 1))
except Exception:
    pass

if not hasattr(google.protobuf.symbol_database.SymbolDatabase, 'GetPrototype'):
    google.protobuf.symbol_database.SymbolDatabase.GetPrototype = lambda self, descriptor: google.protobuf.message_factory.GetMessageClass(descriptor)

from ml_service.shared.config import MLConfig
from ml_service.shared.exceptions import PreprocessingError

try:
    import mediapipe as mp
    _POSE = mp.solutions.pose
except Exception:
    mp = None
    _POSE = None

_NAMES = {
    11: "left_shoulder", 12: "right_shoulder",
    13: "left_elbow", 14: "right_elbow",
    23: "left_hip", 24: "right_hip",
    25: "left_knee", 26: "right_knee",
    27: "left_ankle", 28: "right_ankle",
    0: "nose",
}


def extract(img_rgb: np.ndarray) -> tuple[dict, list[dict], np.ndarray | None]:
    if _POSE is None:
        raise PreprocessingError("MediaPipe not installed.")

    with _POSE.Pose(
        static_image_mode=True,
        model_complexity=MLConfig.MEDIAPIPE_MODEL_COMPLEXITY,
        enable_segmentation=True,
        min_detection_confidence=MLConfig.MEDIAPIPE_MIN_DETECTION_CONFIDENCE
    ) as pose:
        result = pose.process(img_rgb)

    if not result.pose_landmarks:
        raise PreprocessingError("No person detected. Ensure full front-view body is visible.")

    raw = []
    named = {}
    for idx, lm in enumerate(result.pose_landmarks.landmark):
        item = {
            "x": float(lm.x),
            "y": float(lm.y),
            "z": float(lm.z),
            "visibility": float(lm.visibility)
        }
        raw.append(item)
        if idx in _NAMES:
            named[_NAMES[idx]] = item

    for key in ("left_shoulder", "right_shoulder", "left_hip", "right_hip"):
        if named.get(key, {}).get("visibility", 0) < 0.10:
            raise PreprocessingError(
                f"Low landmark visibility for {key}. Re-take photo with better lighting and full front view."
            )

    return named, raw, result.segmentation_mask
