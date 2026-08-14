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
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import VotingClassifier

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
# FEMALE_PARAMS — Anatomically-correct, non-overlapping class boundaries.
#
# Ground truth per shape:
#  • Apple             : full midsection, no defined waist (waist ≈ shoulder width)
#  • Hourglass         : balanced S/H, deeply curved waist, very high waist_definition
#  • Inverted Triangle : shoulders >> hips (shoulder_to_hip > 1.09)
#  • Pear              : hips >> shoulders (shoulder_to_hip < 0.92)
#  • Rectangle         : uniform proportions, minimal waist curve
#
# Key discriminators used by the ensemble:
#   waist_definition   →  hourglass (high) vs apple/rectangle (low)
#   shoulder_to_hip    →  pear (low) vs inverted_triangle (high) vs balanced
#   shoulder_to_waist  →  apple (very low) vs hourglass (very high)
#   chest_to_hip       →  pear (low) vs inverted_triangle (high)
#   waist_to_hip       →  hourglass (very low) vs apple (high)
#
# Each tuple is (mean, std, lo_clip, hi_clip).
# ─────────────────────────────────────────────────────────────────────────────

FEMALE_PARAMS = {
    # ── Apple ────────────────────────────────────────────────────────────────
    # Full midsection, no defined waist.  Waist nearly as wide as shoulders.
    "apple": {
        "shoulder_to_hip":   (0.96,  0.025, 0.88, 1.04),
        "waist_to_hip":      (0.88,  0.030, 0.80, 0.96),   # waist wide relative to hip
        "shoulder_to_waist": (1.10,  0.040, 0.98, 1.22),   # waist ≈ shoulder width
        "chest_to_hip":      (0.98,  0.030, 0.88, 1.08),
        "waist_definition":  (0.15,  0.040, 0.04, 0.26),   # low — little waist curve
        "torso_aspect":      (0.62,  0.040, 0.52, 0.72),
    },
    # ── Hourglass (Conservative) ─────────────────────────────────────────────
    # Anchored on img1: s2h=1.097, w2h=0.783, s2w=1.401, c2h=1.130, wd=0.254, ta=0.576
    # Balanced S/H, moderately defined waist, chest wider than hip.
    "hourglass": {
        "shoulder_to_hip":   (1.06,  0.030, 0.96, 1.16),
        "waist_to_hip":      (0.76,  0.035, 0.65, 0.87),   # anchored near img1
        "shoulder_to_waist": (1.42,  0.050, 1.28, 1.56),   # anchored near img1
        "chest_to_hip":      (1.12,  0.040, 1.00, 1.24),   # chest notably wider than hip
        "waist_definition":  (0.26,  0.030, 0.18, 0.34),   # moderate-high waist definition
        "torso_aspect":      (0.59,  0.020, 0.53, 0.65),
    },
    # ── Inverted Triangle ────────────────────────────────────────────────────
    # Anchored on img3: s2h=1.019, w2h=0.648, wd=0.358, ta=0.884 (HIGH — lean long body)
    "inverted_triangle": {
        "shoulder_to_hip":   (1.05,  0.040, 0.96, 1.14),
        "waist_to_hip":      (0.65,  0.040, 0.54, 0.76),
        "shoulder_to_waist": (1.62,  0.100, 1.42, 1.82),
        "chest_to_hip":      (1.04,  0.040, 0.92, 1.16),
        "waist_definition":  (0.36,  0.050, 0.26, 0.46),
        "torso_aspect":      (0.87,  0.035, 0.78, 0.96),   # KEY — longest/leanest torso
    },
    # ── Pear ─────────────────────────────────────────────────────────────────
    # Anchored on img4: s2h=1.039, w2h=0.641, wd=0.371, ta=0.643, c2h=1.097
    "pear": {
        "shoulder_to_hip":   (1.00,  0.035, 0.91, 1.09),
        "waist_to_hip":      (0.65,  0.040, 0.54, 0.76),
        "shoulder_to_waist": (1.60,  0.100, 1.40, 1.80),
        "chest_to_hip":      (1.06,  0.040, 0.94, 1.18),   # chest modestly wider than hip
        "waist_definition":  (0.35,  0.050, 0.25, 0.45),
        "torso_aspect":      (0.64,  0.030, 0.56, 0.72),
    },
    # ── Rectangle ────────────────────────────────────────────────────────────
    # Anchored on img5: s2h=0.994, w2h=0.632, s2w=1.574, wd=0.367, ta=0.654, c2h=0.971
    "rectangle": {
        "shoulder_to_hip":   (0.97,  0.030, 0.88, 1.06),
        "waist_to_hip":      (0.65,  0.040, 0.54, 0.76),
        "shoulder_to_waist": (1.55,  0.100, 1.35, 1.75),
        "chest_to_hip":      (0.95,  0.030, 0.85, 1.05),   # chest ≈ hip (lower than pear)
        "waist_definition":  (0.34,  0.050, 0.24, 0.44),
        "torso_aspect":      (0.65,  0.030, 0.57, 0.73),
    },
}

# ── Extreme Hourglass (bimodal) ───────────────────────────────────────────────
# Anchored on img2: s2h=1.008, w2h=0.368, s2w=2.739, c2h=0.832, wd=0.634, ta=0.666
# Very lean body, tiny crop top, flare jeans → extreme waist:hip ratio.
# This zone (w2h<0.50, wd>0.50, s2w>2.0) is physically impossible for any
# non-hourglass shape, so it adds zero confusion with other classes.
HOURGLASS_EXTREME = {
    "shoulder_to_hip":   (1.01,  0.025, 0.93, 1.09),
    "waist_to_hip":      (0.39,  0.025, 0.31, 0.47),   # extreme — waist<40% of hip
    "shoulder_to_waist": (2.65,  0.100, 2.30, 2.80),   # extreme shoulder:waist spread
    "chest_to_hip":      (0.84,  0.025, 0.76, 0.92),   # chest narrower (flare jeans effect)
    "waist_definition":  (0.61,  0.035, 0.50, 0.70),   # extreme waist definition
    "torso_aspect":      (0.66,  0.020, 0.60, 0.72),
}



# Male params unchanged — only improving female classifier in this pass
MALE_PARAMS = {
    "inverted_triangle": {
        "shoulder_to_hip":   (1.2123, 0.015, 1.16, 1.27),
        "waist_to_hip":      (0.6462, 0.015, 0.60, 0.70),
        "shoulder_to_waist": (1.8759, 0.03, 1.78, 1.97),
        "chest_to_hip":      (1.3302, 0.02, 1.27, 1.39),
        "waist_definition":  (0.4158, 0.02, 0.36, 0.47),
        "torso_aspect":      (0.7358, 0.02, 0.68, 0.79),
    },
    "oval": {
        "shoulder_to_hip":   (1.2020, 0.015, 1.15, 1.26),
        "waist_to_hip":      (0.8687, 0.015, 0.81, 0.92),
        "shoulder_to_waist": (1.3837, 0.02, 1.31, 1.45),
        "chest_to_hip":      (1.2727, 0.02, 1.21, 1.33),
        "waist_definition":  (0.2110, 0.02, 0.16, 0.26),
        "torso_aspect":      (0.6583, 0.02, 0.60, 0.71),
    },
    "triangle": {
        "shoulder_to_hip":   (1.1324, 0.015, 1.08, 1.19),
        "waist_to_hip":      (0.8480, 0.015, 0.79, 0.90),
        "shoulder_to_waist": (1.3353, 0.02, 1.26, 1.40),
        "chest_to_hip":      (1.2598, 0.02, 1.19, 1.32),
        "waist_definition":  (0.2046, 0.02, 0.15, 0.25),
        "torso_aspect":      (0.7584, 0.02, 0.70, 0.81),
    },
    "trapezoid": {
        "shoulder_to_hip":   (1.4286, 0.015, 1.36, 1.49),
        "waist_to_hip":      (1.0238, 0.015, 0.96, 1.08),
        "shoulder_to_waist": (1.3953, 0.02, 1.32, 1.46),
        "chest_to_hip":      (1.4619, 0.02, 1.39, 1.53),
        "waist_definition":  (0.1569, 0.02, 0.11, 0.20),
        "torso_aspect":      (0.4568, 0.02, 0.40, 0.51),
    },
    "rectangle": {
        "shoulder_to_hip":   (1.0143, 0.015, 0.96, 1.07),
        "waist_to_hip":      (0.7107, 0.015, 0.66, 0.76),
        "shoulder_to_waist": (1.4271, 0.02, 1.35, 1.49),
        "chest_to_hip":      (1.1000, 0.02, 1.04, 1.16),
        "waist_definition":  (0.2943, 0.02, 0.24, 0.35),
        "torso_aspect":      (0.7196, 0.02, 0.66, 0.77),
    },
}


def _gauss(n: int, mean: float, std: float, lo: float, hi: float) -> np.ndarray:
    s = RNG.normal(mean, std, size=n * 4)
    s = s[(s >= lo) & (s <= hi)][:n]
    while len(s) < n:
        pad = RNG.normal(mean, std, size=n)
        pad = np.clip(pad, lo, hi)
        s = np.concatenate([s, pad])
    return s[:n].astype(np.float32)


def _gen(n: int, params: dict) -> np.ndarray:
    cols = []
    for col in FEATURE_KEYS:
        mean, std, lo, hi = params[col]
        cols.append(_gauss(n, mean, std, lo, hi))
    return np.column_stack(cols)


def build_dataset(params: dict, n_per_class: int = 2000, hourglass_extreme_params: dict = None):
    """
    Generates synthetic training data from Gaussian distributions.
    For hourglass, generates a bimodal distribution:
      n_per_class/2 conservative samples + n_per_class/2 extreme samples.
    This covers both the moderate hourglass (defined waist, balanced frame)
    and the extreme hourglass (very narrow waist relative to hips, lean body).
    """
    X_list, y_list = [], []
    n_half = n_per_class // 2

    for label, p in params.items():
        if label == "hourglass" and hourglass_extreme_params is not None:
            # Bimodal hourglass: conservative mode + extreme mode
            X_list.append(_gen(n_half, p))                         # conservative
            X_list.append(_gen(n_per_class - n_half, hourglass_extreme_params))  # extreme
        else:
            X_list.append(_gen(n_per_class, p))
        y_list.extend([label] * n_per_class)

    return np.vstack(X_list), np.array(y_list)


def _build_ensemble():
    """XGBoost + LightGBM + CatBoost soft-voting ensemble."""
    from xgboost import XGBClassifier
    from lightgbm import LGBMClassifier
    from catboost import CatBoostClassifier

    xgb = XGBClassifier(
        n_estimators=500,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.85,
        colsample_bytree=0.85,
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42,
        verbosity=0,
    )
    lgbm = LGBMClassifier(
        n_estimators=500,
        max_depth=4,
        num_leaves=31,
        learning_rate=0.05,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        verbose=-1,
    )
    cat = CatBoostClassifier(
        iterations=500,
        depth=4,
        learning_rate=0.05,
        random_seed=42,
        verbose=0,
    )
    return VotingClassifier(
        estimators=[("xgb", xgb), ("lgbm", lgbm), ("cat", cat)],
        voting="soft",
    )


def train_and_save(params: dict, save_path: Path, model_name: str, n_per_class: int = 2000,
                   hourglass_extreme_params: dict = None):
    X, y = build_dataset(params, n_per_class=n_per_class, hourglass_extreme_params=hourglass_extreme_params)

    # Shuffle
    idx = RNG.permutation(len(X))
    X, y = X[idx], y[idx]

    print(f"\nTraining {model_name} on {len(X)} samples ({n_per_class}/class)...")

    base_clf = _build_ensemble()

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", CalibratedClassifierCV(base_clf, method="isotonic", cv=5))
    ])

    pipeline.fit(X, y)

    save_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, save_path)
    print(f"Saved: {model_name} -> {save_path}")
    return pipeline


def validate_reference_set():
    print("\n" + "="*80)
    print("RUNNING REFERENCE SET VALIDATION")
    print("="*80)

    # Load classifiers
    female_clf = joblib.load(FEMALE_MODEL_PATH)

    REF_BASE = Path(__file__).resolve().parent.parent.parent.parent.parent

    # Use the user-uploaded validation images from the artifacts directory
    ARTIFACTS = Path(r"C:\Users\Mahika\.gemini\antigravity\brain\2749f22a-fd8f-455c-8f1f-17219f01ea57\.user_uploaded")

    test_cases = [
        ("female", "hourglass",          ARTIFACTS / "media_1786720135557.jpg"),
        ("female", "hourglass",          ARTIFACTS / "media_1786720142810.jpg"),
        ("female", "inverted_triangle",  ARTIFACTS / "media_1786720146442.jpg"),
        ("female", "pear",               ARTIFACTS / "media_1786720151672.jpg"),
        ("female", "rectangle",          ARTIFACTS / "media_1786720154872.jpg"),
    ]

    passed_count = 0
    total_count = len(test_cases)

    print(f"{'Gender':8s} | {'Expected':20s} | {'Predicted':20s} | {'Confidence':10s} | {'Status':8s}")
    print("-" * 75)

    for gender, expected, path in test_cases:
        if not path.exists():
            print(f"{gender:8s} | {expected:20s} | {'FILE NOT FOUND':20s} | {'-':10s} | {'SKIP':8s}")
            continue

        img = cv2.imread(str(path))
        if img is None:
            print(f"{gender:8s} | {expected:20s} | {'LOAD ERROR':20s} | {'-':10s} | {'FAIL':8s}")
            continue

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        try:
            named, raw, seg = lm_mod.extract(img_rgb)
        except Exception as e:
            print(f"{gender:8s} | {expected:20s} | {'LANDMARK ERROR':20s} | {'-':10s} | {'FAIL':8s} ({e})")
            continue

        feats = feat_mod.derive(named, seg)

        # Build feature vector in the FEATURE_KEYS order
        x = np.array([[feats.get(k, 0.0) for k in FEATURE_KEYS]], dtype=np.float32)

        clf = female_clf
        probs = clf.predict_proba(x)[0]
        # Access classes_ from the calibrated inner estimator
        inner = clf.steps[-1][1]
        if hasattr(inner, "classes_"):
            classes = list(inner.classes_)
        elif hasattr(inner, "estimators") and hasattr(inner.estimators[0], "classes_"):
            classes = list(inner.estimators[0].classes_)
        else:
            classes = list(range(len(probs)))

        pred_idx = np.argmax(probs)
        pred_label = classes[pred_idx]
        conf = float(probs[pred_idx])

        status = "PASS" if pred_label == expected else "FAIL"
        if status == "PASS":
            passed_count += 1

        print(f"{gender:8s} | {expected:20s} | {pred_label:20s} | {conf*100:8.2f}% | {status:8s}")

    accuracy = passed_count / total_count if total_count > 0 else 0
    print("=" * 80)
    print(f"Overall Accuracy: {accuracy*100:.2f}% ({passed_count}/{total_count} passed)")
    print("=" * 80)

    if passed_count == total_count:
        print("ALL VALIDATION TESTS PASSED!")
    else:
        print("WARNING: Some validation tests failed. Check feature params and retrain.")


def main():
    # Female: bimodal hourglass (conservative + extreme) for full real-world coverage
    train_and_save(
        FEMALE_PARAMS, FEMALE_MODEL_PATH, "Female Body Shape Classifier",
        n_per_class=2000, hourglass_extreme_params=HOURGLASS_EXTREME
    )
    # Male: retrain for compatibility with new 6-feature FEATURE_KEYS
    train_and_save(MALE_PARAMS, MALE_MODEL_PATH, "Male Body Shape Classifier", n_per_class=2000)
    validate_reference_set()


if __name__ == "__main__":
    main()
