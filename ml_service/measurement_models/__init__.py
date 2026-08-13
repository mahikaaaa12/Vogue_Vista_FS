"""
ml_service.measurement_models

Measurement-based Body Shape Analysis Module.
"""

from .inference.predictor import BodyShapePredictor
from .classifiers.classifier import predict as predict_measurement_shape

__all__ = ["BodyShapePredictor", "predict_measurement_shape"]
