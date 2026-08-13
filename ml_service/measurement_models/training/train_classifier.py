"""
ml_service.measurement_models.training.train_classifier

Training pipeline for Scikit-Learn measurement classifiers.
"""

from pathlib import Path
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from ml_service.shared.config import MLConfig
from ml_service.shared.constants import FEATURE_KEYS
from ml_service.shared.logger import get_logger

logger = get_logger("TrainClassifier")


def train_and_save_classifier(X: np.ndarray, y: np.ndarray, save_path: Path):
    """Trains a StandardScaler + RandomForest pipeline and saves to disk."""
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    pipeline.fit(X, y)
    save_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, save_path)
    logger.info("Successfully trained and saved model to %s", save_path)
    return pipeline
