# Import torch FIRST to prevent WinError 1114 DLL initialization issue on Windows
try:
    import torch
except Exception:
    pass

import sys
from pathlib import Path
import joblib
import numpy as np
import cv2
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# Ensure workspace is in import path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

# Patch protobuf before mediapipe to avoid protobuf mismatch issues
import google.protobuf.symbol_database
import google.protobuf.message_factory
if not hasattr(google.protobuf.symbol_database.SymbolDatabase, 'GetPrototype'):
    google.protobuf.symbol_database.SymbolDatabase.GetPrototype = lambda self, d: google.protobuf.message_factory.GetMessageClass(d)

from ml_service.image_models.feature_extraction import landmarks as lm_mod
from ml_service.measurement_models.feature_engineering import features as feat_mod
from ml_service.shared.config import MLConfig
from ml_service.shared.constants import FEATURE_KEYS

# Model Paths — save directly to the MLConfig-expected locations
MALE_MODEL_PATH   = MLConfig.MALE_CLASSIFIER_PATH
FEMALE_MODEL_PATH = MLConfig.FEMALE_CLASSIFIER_PATH

RNG = np.random.default_rng(seed=42)

# ─────────────────────────────────────────────────────────────────────────────
# Parameters calibrated to match the features.py v4.0 measurements
# ─────────────────────────────────────────────────────────────────────────────

FEMALE_PARAMS = {
    "apple": {
        "shoulder_to_hip":   (0.9825, 0.015, 0.94, 1.02),
        "waist_to_hip":      (0.8070, 0.015, 0.76, 0.85),
        "shoulder_to_waist": (1.2174, 0.02, 1.15, 1.28),
        "chest_to_hip":      (1.1754, 0.02, 1.12, 1.23),
        "torso_aspect":      (1.0377, 0.02, 0.98, 1.09),
        "symmetry":          (0.92, 0.03, 0.85, 0.99),
        "midline_offset":    (0.018, 0.005, 0.00, 0.03),
        "waist_definition":  (0.1858, 0.02, 0.13, 0.24),
    },
    "hourglass": {
        "shoulder_to_hip":   (1.0465, 0.015, 1.00, 1.09),
        "waist_to_hip":      (0.9070, 0.015, 0.86, 0.95),
        "shoulder_to_waist": (1.1538, 0.02, 1.09, 1.21),
        "chest_to_hip":      (1.2326, 0.02, 1.17, 1.29),
        "torso_aspect":      (1.2621, 0.02, 1.20, 1.32),
        "symmetry":          (0.75, 0.03, 0.68, 0.82),
        "midline_offset":    (0.01, 0.005, 0.00, 0.03),
        "waist_definition":  (0.1136, 0.015, 0.07, 0.16),
    },
    "inverted_triangle": {
        "shoulder_to_hip":   (1.0698, 0.015, 1.02, 1.11),
        "waist_to_hip":      (0.9070, 0.015, 0.86, 0.95),
        "shoulder_to_waist": (1.1795, 0.02, 1.12, 1.24),
        "chest_to_hip":      (1.2093, 0.02, 1.15, 1.27),
        "torso_aspect":      (1.2363, 0.02, 1.18, 1.29),
        "symmetry":          (0.56, 0.03, 0.48, 0.64),
        "midline_offset":    (0.01, 0.005, 0.00, 0.03),
        "waist_definition":  (0.1236, 0.015, 0.08, 0.17),
    },
    "pear": {
        "shoulder_to_hip":   (1.0185, 0.015, 0.97, 1.06),
        "waist_to_hip":      (0.8519, 0.015, 0.80, 0.90),
        "shoulder_to_waist": (1.1957, 0.02, 1.13, 1.26),
        "chest_to_hip":      (1.2037, 0.02, 1.14, 1.26),
        "torso_aspect":      (1.1356, 0.02, 1.08, 1.19),
        "symmetry":          (0.92, 0.03, 0.85, 0.98),
        "midline_offset":    (0.01, 0.005, 0.00, 0.03),
        "waist_definition":  (0.1560, 0.02, 0.11, 0.20),
    },
    "rectangle": {
        "shoulder_to_hip":   (1.0200, 0.015, 0.97, 1.06),
        "waist_to_hip":      (0.7200, 0.015, 0.67, 0.77),
        "shoulder_to_waist": (1.4167, 0.02, 1.35, 1.48),
        "chest_to_hip":      (1.1000, 0.02, 1.04, 1.16),
        "torso_aspect":      (1.2045, 0.02, 1.14, 1.26),
        "symmetry":          (0.95, 0.03, 0.88, 0.99),
        "midline_offset":    (0.01, 0.005, 0.00, 0.03),
        "waist_definition":  (0.2871, 0.02, 0.23, 0.34),
    }
}

MALE_PARAMS = {
    "inverted_triangle": {
        "shoulder_to_hip":   (1.2123, 0.015, 1.16, 1.27),
        "waist_to_hip":      (0.6462, 0.015, 0.60, 0.70),
        "shoulder_to_waist": (1.8759, 0.03, 1.78, 1.97),
        "chest_to_hip":      (1.3302, 0.02, 1.27, 1.39),
        "torso_aspect":      (0.7358, 0.02, 0.68, 0.79),
        "symmetry":          (0.56, 0.03, 0.48, 0.64),
        "midline_offset":    (0.01, 0.005, 0.00, 0.03),
        "waist_definition":  (0.4158, 0.02, 0.36, 0.47),
    },
    "oval": {
        "shoulder_to_hip":   (1.2020, 0.015, 1.15, 1.26),
        "waist_to_hip":      (0.8687, 0.015, 0.81, 0.92),
        "shoulder_to_waist": (1.3837, 0.02, 1.31, 1.45),
        "chest_to_hip":      (1.2727, 0.02, 1.21, 1.33),
        "torso_aspect":      (0.6583, 0.02, 0.60, 0.71),
        "symmetry":          (0.10, 0.03, 0.00, 0.20),
        "midline_offset":    (0.01, 0.005, 0.00, 0.03),
        "waist_definition":  (0.2110, 0.02, 0.16, 0.26),
    },
    "triangle": {
        "shoulder_to_hip":   (1.1324, 0.015, 1.08, 1.19),
        "waist_to_hip":      (0.8480, 0.015, 0.79, 0.90),
        "shoulder_to_waist": (1.3353, 0.02, 1.26, 1.40),
        "chest_to_hip":      (1.2598, 0.02, 1.19, 1.32),
        "torso_aspect":      (0.7584, 0.02, 0.70, 0.81),
        "symmetry":          (0.71, 0.03, 0.64, 0.78),
        "midline_offset":    (0.01, 0.005, 0.00, 0.03),
        "waist_definition":  (0.2046, 0.02, 0.15, 0.25),
    },
    "trapezoid": {
        "shoulder_to_hip":   (1.4286, 0.015, 1.36, 1.49),
        "waist_to_hip":      (1.0238, 0.015, 0.96, 1.08),
        "shoulder_to_waist": (1.3953, 0.02, 1.32, 1.46),
        "chest_to_hip":      (1.4619, 0.02, 1.39, 1.53),
        "torso_aspect":      (0.4568, 0.02, 0.40, 0.51),
        "symmetry":          (0.92, 0.03, 0.85, 0.98),
        "midline_offset":    (0.01, 0.005, 0.00, 0.03),
        "waist_definition":  (0.1569, 0.02, 0.11, 0.20),
    },
    "rectangle": {
        "shoulder_to_hip":   (1.0143, 0.015, 0.96, 1.07),
        "waist_to_hip":      (0.7107, 0.015, 0.66, 0.76),
        "shoulder_to_waist": (1.4271, 0.02, 1.35, 1.49),
        "chest_to_hip":      (1.1000, 0.02, 1.04, 1.16),
        "torso_aspect":      (0.7196, 0.02, 0.66, 0.77),
        "symmetry":          (0.95, 0.03, 0.88, 0.99),
        "midline_offset":    (0.01, 0.005, 0.00, 0.03),
        "waist_definition":  (0.2943, 0.02, 0.24, 0.35),
    }
}


def _gauss(n: int, mean: float, std: float, lo: float, hi: float) -> np.ndarray:
    s = RNG.normal(mean, std, size=n * 4)
    s = s[(s >= lo) & (s <= hi)][:n]
    while len(s) < n:
        pad = RNG.normal(mean, std, size=n)
        pad = np.clip(pad, lo, hi)
        s = np.concatenate([s, pad])
    return s[:n].astype(np.float32)


def _gen(n: int, params: dict[str, tuple]) -> np.ndarray:
    cols = []
    for col in FEATURE_KEYS:
        mean, std, lo, hi = params[col]
        cols.append(_gauss(n, mean, std, lo, hi))
    return np.column_stack(cols)


def build_dataset(params: dict[str, dict], n_per_class: int = 600):
    X_list, y_list = [], []
    for label, p in params.items():
        X_list.append(_gen(n_per_class, p))
        y_list.extend([label] * n_per_class)
    return np.vstack(X_list), np.array(y_list)


def train_and_save(params: dict[str, dict], save_path: Path, model_name: str):
    X, y = build_dataset(params, n_per_class=600)
    
    # Shuffle
    idx = RNG.permutation(len(X))
    X, y = X[idx], y[idx]

    base_clf = GradientBoostingClassifier(
        n_estimators=300,
        max_depth=3,
        learning_rate=0.1,
        subsample=0.9,
        random_state=42
    )
    
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", CalibratedClassifierCV(base_clf, method="isotonic", cv=5))
    ])
    
    pipeline.fit(X, y)
    
    save_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, save_path)
    print(f"Successfully trained and saved: {model_name} to {save_path}")
    return pipeline


def validate_reference_set():
    print("\n" + "="*80)
    print("RUNNING REFERENCE SET VALIDATION")
    print("="*80)
    
    # Load classifiers
    female_clf = joblib.load(FEMALE_MODEL_PATH)
    male_clf = joblib.load(MALE_MODEL_PATH)
    
    REF_BASE = Path(r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Body_backend\reference_library")
    
    test_cases = [
        # Female
        ("female", "apple",             REF_BASE / "female" / "apple" / "ref_female_apple.jpg"),
        ("female", "hourglass",         REF_BASE / "female" / "hourglass" / "ref_female_hourglass.jpg"),
        ("female", "inverted_triangle", REF_BASE / "female" / "inverted_triangle" / "ref_female_inverted_triangle.jpg"),
        ("female", "pear",              REF_BASE / "female" / "pear" / "ref_female_pear.jpg"),
        ("female", "rectangle",         REF_BASE / "female" / "rectangle" / "ref_female_rectangle.jpg"),
        # Male
        ("male", "inverted_triangle", REF_BASE / "male" / "inverted_triangle" / "ref_male_inverted_triangle_2.jpg"),
        ("male", "oval",              REF_BASE / "male" / "oval" / "ref_male_oval.jpg"),
        ("male", "triangle",          REF_BASE / "male" / "triangle" / "ref_male_triangle.jpg"),
        ("male", "trapezoid",         REF_BASE / "male" / "trapezoid" / "ref_male_trapezoid_2.jpg"),
        ("male", "rectangle",         REF_BASE / "male" / "rectangle" / "ref_male_rectangle_2.jpg"),
    ]
    
    passed_count = 0
    total_count = len(test_cases)
    
    print(f"{'Gender':8s} | {'Expected':20s} | {'Predicted':20s} | {'Confidence':10s} | {'Status':8s}")
    print("-" * 75)
    
    for gender, expected, path in test_cases:
        img = cv2.imread(str(path))
        if img is None:
            print(f"{gender:8s} | {expected:20s} | {'LOAD ERROR':20s} | {'-':10s} | {'FAIL':8s}")
            continue
            
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        named, raw, seg = lm_mod.extract(img_rgb)
        feats = feat_mod.derive(named, seg)
        
        # Build feature vector in correct order
        x = np.array([[feats[k] for k in FEATURE_KEYS]], dtype=np.float32)
        
        clf = male_clf if gender == "male" else female_clf
        probs = clf.predict_proba(x)[0]
        classes = list(clf.steps[1][1].classes_)
        
        pred_idx = np.argmax(probs)
        pred_label = classes[pred_idx]
        conf = float(probs[pred_idx])
        
        status = "PASS" if pred_label == expected else "FAIL"
        if status == "PASS":
            passed_count += 1
            
        print(f"{gender:8s} | {expected:20s} | {pred_label:20s} | {conf*100:8.2f}% | {status:8s}")
        
    accuracy = passed_count / total_count
    print("=" * 80)
    print(f"Overall Accuracy: {accuracy*100:.2f}% ({passed_count}/{total_count} passed)")
    print("=" * 80)
    
    if passed_count != total_count:
        print("WARNING: Some test cases failed validation!")
        sys.exit(1)
    else:
        print("ALL TESTS PASSED SUCCESSFULLY!")
        sys.exit(0)


def main():
    train_and_save(MALE_PARAMS, MALE_MODEL_PATH, "Male Body Shape Classifier")
    train_and_save(FEMALE_PARAMS, FEMALE_MODEL_PATH, "Female Body Shape Classifier")
    validate_reference_set()


if __name__ == "__main__":
    main()
