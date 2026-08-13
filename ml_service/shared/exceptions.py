"""
ml_service.shared.exceptions

Custom Exception Hierarchy for Vogue Vista ML Service.
"""


class MLError(Exception):
    """Base Exception for all ML Service Errors."""
    pass


class ModelLoadError(MLError):
    """Raised when a model checkpoint or pipeline artifact fails to load."""
    pass


class ModelNotTrainedError(MLError):
    """Raised when a model file is missing or not yet trained."""
    pass


class PreprocessingError(MLError):
    """Raised when image or numerical measurement preprocessing fails."""
    pass


class PredictionError(MLError):
    """Raised when inference or post-processing encounters an error."""
    pass
