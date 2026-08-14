"""
Diagnostic: print actual extracted feature values for each validation image.
Run from workspace root: python -m ml_service.measurement_models.training.diagnose_features
"""
import sys
import cv2
import numpy as np
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

import google.protobuf.symbol_database
import google.protobuf.message_factory
if not hasattr(google.protobuf.symbol_database.SymbolDatabase, 'GetPrototype'):
    google.protobuf.symbol_database.SymbolDatabase.GetPrototype = (
        lambda self, d: google.protobuf.message_factory.GetMessageClass(d)
    )

from ml_service.image_models.feature_extraction import landmarks as lm_mod
from ml_service.measurement_models.feature_engineering import features as feat_mod
from ml_service.shared.constants import FEATURE_KEYS

ARTIFACTS = Path(r"C:\Users\Mahika\.gemini\antigravity\brain\2749f22a-fd8f-455c-8f1f-17219f01ea57\.user_uploaded")

CASES = [
    ("hourglass",         ARTIFACTS / "media_1786720135557.jpg"),
    ("hourglass",         ARTIFACTS / "media_1786720142810.jpg"),
    ("inverted_triangle", ARTIFACTS / "media_1786720146442.jpg"),
    ("pear",              ARTIFACTS / "media_1786720151672.jpg"),
    ("rectangle",         ARTIFACTS / "media_1786720154872.jpg"),
]

ALL_KEYS = [
    "shoulder_to_hip", "waist_to_hip", "shoulder_to_waist",
    "chest_to_hip", "waist_definition", "torso_aspect",
    "symmetry", "midline_offset",
    "shoulder_width", "waist_width", "hip_width",
]

HDR_W = 22
print(f"\n{'FEATURE':<{HDR_W}}", end="")
for label, _ in CASES:
    print(f"  {label[:14]:<14}", end="")
print()
print("-" * (HDR_W + len(CASES) * 16))

rows = {k: [] for k in ALL_KEYS}

for label, path in CASES:
    img = cv2.imread(str(path))
    if img is None:
        for k in ALL_KEYS:
            rows[k].append("ERROR")
        continue
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    try:
        named, raw, seg = lm_mod.extract(img_rgb)
        feats = feat_mod.derive(named, seg)
        for k in ALL_KEYS:
            rows[k].append(f"{feats.get(k, 0.0):.4f}")
    except Exception as e:
        for k in ALL_KEYS:
            rows[k].append(f"ERR:{str(e)[:10]}")

for k in ALL_KEYS:
    print(f"{k:<{HDR_W}}", end="")
    for val in rows[k]:
        print(f"  {val:<14}", end="")
    print()

print("\n\n--- FEATURE_KEYS used by model ---")
print(FEATURE_KEYS)

# Also print training parameter ranges for comparison
FEMALE_PARAMS_RANGES = {
    "apple":              {"shoulder_to_hip": (0.88, 1.02), "waist_to_hip": (0.86, 0.98), "shoulder_to_waist": (0.97, 1.13), "chest_to_hip": (0.92, 1.04), "waist_definition": (0.01, 0.12),  "torso_aspect": (0.86, 1.04)},
    "hourglass":          {"shoulder_to_hip": (0.95, 1.07), "waist_to_hip": (0.63, 0.76), "shoulder_to_waist": (1.35, 1.58), "chest_to_hip": (0.96, 1.09), "waist_definition": (0.24, 0.43),  "torso_aspect": (1.12, 1.33)},
    "inverted_triangle":  {"shoulder_to_hip": (1.09, 1.24), "waist_to_hip": (0.70, 0.83), "shoulder_to_waist": (1.42, 1.63), "chest_to_hip": (1.07, 1.22), "waist_definition": (0.14, 0.28),  "torso_aspect": (1.08, 1.29)},
    "pear":               {"shoulder_to_hip": (0.79, 0.92), "waist_to_hip": (0.70, 0.83), "shoulder_to_waist": (1.04, 1.20), "chest_to_hip": (0.79, 0.93), "waist_definition": (0.13, 0.27),  "torso_aspect": (1.02, 1.19)},
    "rectangle":          {"shoulder_to_hip": (0.93, 1.07), "waist_to_hip": (0.79, 0.91), "shoulder_to_waist": (1.11, 1.25), "chest_to_hip": (0.88, 1.02), "waist_definition": (0.08, 0.20),  "torso_aspect": (1.08, 1.28)},
}

print("\n\n--- TRAINING PARAMETER RANGES (lo, hi) per shape ---")
shape_names = list(FEMALE_PARAMS_RANGES.keys())
print(f"{'FEATURE':<{HDR_W}}", end="")
for s in shape_names:
    print(f"  {s[:14]:<14}", end="")
print()
for k in ["shoulder_to_hip", "waist_to_hip", "shoulder_to_waist", "chest_to_hip", "waist_definition", "torso_aspect"]:
    print(f"{k:<{HDR_W}}", end="")
    for s in shape_names:
        lo, hi = FEMALE_PARAMS_RANGES[s][k]
        print(f"  {lo:.2f}-{hi:.2f}      ", end="")
    print()
