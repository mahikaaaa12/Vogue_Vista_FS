"""
ml_service.image_models.body_shape

Image-based Body Shape Neural Networks and Predictors.
"""

from .female_multimodal import DualBranchMultimodalNet, MultimodalBodyShapePredictor
from .male_multimodal import DualBranchMaleMultimodalNet, MaleBodyShapePredictor

__all__ = [
    "DualBranchMultimodalNet",
    "MultimodalBodyShapePredictor",
    "DualBranchMaleMultimodalNet",
    "MaleBodyShapePredictor",
]
