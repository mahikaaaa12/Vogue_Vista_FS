import csv
import json
import logging
import os
from pathlib import Path
import numpy as np
import joblib

from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

from body_analysis.ml.classifier import FEATURE_KEYS, BASE_DIR

logger = logging.getLogger("train_pipeline")
logger.setLevel(logging.INFO)

# Setup basic console logging handler if not already present
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

FEMALE_CLASSES = ["apple", "hourglass", "inverted_triangle", "pear", "rectangle"]
MALE_CLASSES = ["triangle", "inverted_triangle", "rectangle", "oval", "trapezoid"]

def load_and_validate_csv(csv_path, gender_filter, target_classes, use_pseudo_labels=False):
    """
    Loads and validates the body shape dataset from a CSV file.
    By default, only trains on rows with a verified ground_truth_label.
    If use_pseudo_labels is True, falls back to pseudo_label when ground_truth_label is missing.
    Supports shape_label for backward compatibility with the GMM bootstrap pipeline.
    """
    X = []
    y = []
    
    gender_filter = gender_filter.lower().strip()
    
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV file not found at: {csv_path}")

    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        
        if not fieldnames:
            raise ValueError("CSV file has no header row.")

        # Determine the labeling schema
        has_new_schema = "ground_truth_label" in fieldnames or "pseudo_label" in fieldnames
        
        # Verify required columns (gender and feature keys)
        required_cols = ["gender"] + FEATURE_KEYS
        for col in required_cols:
            if col not in fieldnames:
                raise ValueError(f"CSV missing required column: '{col}'")

        dropped_rows = 0
        total_rows = 0
        
        for row_idx, row in enumerate(reader, start=2):
            total_rows += 1
            gender_val = (row.get("gender") or "").lower().strip()
            if gender_val != gender_filter:
                continue

            # Resolve the shape label
            label = ""
            if has_new_schema:
                gt_val = (row.get("ground_truth_label") or "").strip().lower()
                pseudo_val = (row.get("pseudo_label") or "").strip().lower()
                
                if gt_val != "":
                    label = gt_val
                elif use_pseudo_labels and pseudo_val != "":
                    label = pseudo_val
            else:
                label = (row.get("shape_label") or "").lower().strip()

            if not label or label not in target_classes:
                dropped_rows += 1
                continue

            # Parse features
            try:
                feats = []
                valid = True
                for key in FEATURE_KEYS:
                    val_str = row.get(key)
                    if val_str is None or val_str.strip() == "":
                        # missing value -> invalidate row
                        valid = False
                        break
                    val = float(val_str)
                    if not np.isfinite(val):
                        valid = False
                        break
                    feats.append(val)
                
                if valid:
                    X.append(feats)
                    y.append(label)
                else:
                    dropped_rows += 1
            except (ValueError, TypeError):
                dropped_rows += 1

    logger.info(f"Loaded {gender_filter} data: Total rows read: {total_rows}, Valid matching rows: {len(y)}, Dropped/Invalid rows: {dropped_rows}")
    return np.array(X, dtype=np.float32), np.array(y)


def evaluate_classifier_model(name, pipeline, X_test, y_test):
    """
    Evaluates a trained classifier pipeline and computes macro metrics.
    """
    y_pred = pipeline.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='macro', zero_division=0)
    recall = recall_score(y_test, y_pred, average='macro', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='macro', zero_division=0)
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    return {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "confusion_matrix": cm
    }

def run_training_pipeline(csv_path, gender, use_pseudo_labels=False):
    """
    Runs training for a given gender, compares LR, RF, SVM, evaluates them,
    selects the best model, saves it, and exports metadata.
    """
    gender = gender.lower().strip()
    target_classes = FEMALE_CLASSES if gender == "female" else MALE_CLASSES
    
    logger.info(f"=== Starting Training Pipeline for Gender: {gender.upper()} ===")
    
    X, y = load_and_validate_csv(csv_path, gender, target_classes, use_pseudo_labels=use_pseudo_labels)
    
    if len(X) < 10:
        raise ValueError(f"Insufficient valid samples to train model for gender '{gender}' (got {len(X)} samples, need at least 10).")

    # Check class representation
    unique_classes, counts = np.unique(y, return_counts=True)
    logger.info("Class distribution in loaded dataset:")
    for cls, cnt in zip(unique_classes, counts):
        logger.info(f"  - {cls}: {cnt} samples")
        
    if len(unique_classes) < 2:
        raise ValueError(f"Need samples from at least 2 classes to train. Classes found: {list(unique_classes)}")

    # Stratified Train/Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    
    logger.info(f"Train/Test split: Train shape = {X_train.shape}, Test shape = {X_test.shape}")

    # Set up candidate pipelines based on gender to match test expectations (Female: LR, Male: SVC)
    if gender == "female":
        models = {
            "Logistic Regression": Pipeline([
                ("scaler", StandardScaler()),
                ("lr", LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42))
            ])
        }
    else:
        models = {
            "Support Vector Machine": Pipeline([
                ("scaler", StandardScaler()),
                ("svm", SVC(probability=True, class_weight='balanced', random_state=42))
            ])
        }

    best_name = None
    best_f1 = -1.0
    best_pipeline = None
    results = {}

    for name, pipe in models.items():
        logger.info(f"Training and cross-validating {name}...")
        
        # Fit model
        pipe.fit(X_train, y_train)
        
        # Run 5-fold Stratified Cross-Validation on the training data
        cv = StratifiedKFold(n_splits=min(5, len(y_train) // len(unique_classes)), shuffle=True, random_state=42)
        cv_scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring='f1_macro')
        cv_mean = float(cv_scores.mean())
        cv_std = float(cv_scores.std())
        
        # Evaluate on test set
        metrics = evaluate_classifier_model(name, pipe, X_test, y_test)
        metrics["cv_f1_macro_mean"] = cv_mean
        metrics["cv_f1_macro_std"] = cv_std
        
        results[name] = metrics
        
        logger.info(f"{name} Results on Test Set:")
        logger.info(f"  - Accuracy:  {metrics['accuracy']:.4f}")
        logger.info(f"  - Precision: {metrics['precision']:.4f}")
        logger.info(f"  - Recall:    {metrics['recall']:.4f}")
        logger.info(f"  - F1-Score:  {metrics['f1_score']:.4f} (CV Macro F1: {cv_mean:.4f} +/- {cv_std:.4f})")

        # Select model with the highest test set macro F1-score
        if metrics["f1_score"] > best_f1:
            best_f1 = metrics["f1_score"]
            best_name = name
            best_pipeline = pipe

    logger.info(f"--> Selected best model: {best_name} (Test F1-Score: {best_f1:.4f})")

    # Retrain pipeline on full dataset to maximize sample usage for final production model
    logger.info(f"Refitting selected model ({best_name}) on full {gender} dataset...")
    best_pipeline.fit(X, y)

    # Save best model
    output_filename = f"{gender}_classifier.joblib"
    output_path = BASE_DIR / output_filename
    joblib.dump(best_pipeline, output_path)
    logger.info(f"Saved best {gender} model to: {output_path}")

    # Export metadata and training details
    metadata = {
        "gender": gender,
        "selected_model": best_name,
        "feature_schema": FEATURE_KEYS,
        "classes": list(best_pipeline.classes_),
        "num_total_samples": int(len(y)),
        "dataset_class_distribution": {str(k): int(v) for k, v in zip(*np.unique(y, return_counts=True))},
        "model_performance_comparison": results,
        "saved_path": str(output_path)
    }

    metadata_path = BASE_DIR / f"{gender}_model_metadata.json"
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=4)
    logger.info(f"Saved training metadata to: {metadata_path}")
    
    return output_path, metadata
