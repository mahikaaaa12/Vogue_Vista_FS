"""
ml_service.measurement_models.preprocessing.validation

Input validation helpers for numerical body measurements and features.
"""

from typing import Dict, Any
from ml_service.shared.exceptions import PreprocessingError


def validate_measurement_input(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validates raw numerical measurement input dict."""
    if not isinstance(data, dict):
        raise PreprocessingError("Measurement input must be a dictionary.")

    required_keys = {"shoulder", "waist", "hip"}
    ratio_keys = {"shoulder_to_hip", "waist_to_hip", "shoulder_to_waist"}

    has_raw = required_keys.issubset(data.keys())
    has_ratios = ratio_keys.issubset(data.keys())

    if not (has_raw or has_ratios):
        raise PreprocessingError(
            f"Measurement input must contain either raw measurements {required_keys} or ratios {ratio_keys}."
        )

    return data
