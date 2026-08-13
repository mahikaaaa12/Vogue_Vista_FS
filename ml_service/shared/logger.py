"""
ml_service.shared.logger

Standardized Logging Framework for Vogue Vista ML Service.
"""

import logging
import sys


def get_logger(name: str = "ml_service") -> logging.Logger:
    """Returns a configured logger with standard formatting."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger
