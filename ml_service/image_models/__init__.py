"""
ml_service.image_models

Image-based Machine Learning Module.
"""

from .inference.body_shape_service import UnifiedBodyShapeService
from .body_shape.female_multimodal import MultimodalBodyShapePredictor
from .body_shape.male_multimodal import MaleBodyShapePredictor

__all__ = [
    "UnifiedBodyShapeService",
    "MultimodalBodyShapePredictor",
    "MaleBodyShapePredictor",
]
