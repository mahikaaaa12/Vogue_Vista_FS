import os
import sys

# Ensure django is not loaded if we don't need it, but let's add paths
sys.path.append(r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Vogue_Vista_FS")

from ml_service.image_models.feature_extraction import landmarks as lm_mod
from ml_service.measurement_models.feature_engineering import features as feat_mod
import cv2
import numpy as np

ref_dir = r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Body_backend\reference_library"

female_images = {
    "apple": os.path.join(ref_dir, "female", "apple", "ref_female_apple.jpg"),
    "hourglass": os.path.join(ref_dir, "female", "hourglass", "ref_female_hourglass.jpg"),
    "inverted_triangle": os.path.join(ref_dir, "female", "inverted_triangle", "ref_female_inverted_triangle.jpg"),
    "pear": os.path.join(ref_dir, "female", "pear", "ref_female_pear.jpg"),
    "rectangle": os.path.join(ref_dir, "female", "rectangle", "ref_female_rectangle.jpg"),
}

male_images = {
    "inverted_triangle": os.path.join(ref_dir, "male", "inverted_triangle", "ref_male_inverted_triangle.jpg"),
    "oval": os.path.join(ref_dir, "male", "oval", "ref_male_oval.jpg"),
    "rectangle": os.path.join(ref_dir, "male", "rectangle", "ref_male_rectangle.jpg"),
    "trapezoid": os.path.join(ref_dir, "male", "trapezoid", "ref_male_trapezoid.jpg"),
    "triangle": os.path.join(ref_dir, "male", "triangle", "ref_male_triangle.jpg"),
}

# Apply the threshold fix dynamically in memory for testing
def patched_mask_width(mask, target_y_norm: float, center_x_norm: float) -> float | None:
    if mask is None:
        return None
    h, w = mask.shape[:2]
    row_idx = int(max(0.0, min(0.999, target_y_norm)) * h)
    row = mask[row_idx, :] > 0.5  # Fixed threshold!
    if not np.any(row):
        return None
    cols = np.where(row)[0]
    return float((cols[-1] - cols[0]) / float(w))

def patched_estimate_waist(mask, shoulder_mid, hip_mid, fallback: float) -> float:
    if mask is None:
        return float(fallback)
    h, w = mask.shape[:2]
    start_y = int(max(0.0, min(0.999, shoulder_mid[1])) * h)
    end_y = int(max(0.0, min(0.999, hip_mid[1])) * h)
    if end_y <= start_y + 2:
        return float(fallback)

    torso_slice = mask[start_y:end_y, :] > 0.5  # Fixed threshold!
    widths = []
    for row in torso_slice:
        if np.any(row):
            cols = np.where(row)[0]
            widths.append((cols[-1] - cols[0]) / float(w))
    if not widths:
        return float(fallback)
    return float(np.min(widths))

# Temporarily override functions
feat_mod._mask_width = patched_mask_width
feat_mod._estimate_waist = patched_estimate_waist

def test_features():
    print("=== FEMALE REFERENCE IMAGES ===")
    for shape, path in female_images.items():
        if not os.path.exists(path):
            continue
        img = cv2.imread(path)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        named, raw, mask = lm_mod.extract(img_rgb)
        derived = feat_mod.derive(named, mask)
        print(f"Shape: {shape:<18} | sh_hip: {derived['shoulder_to_hip']:.4f} | wa_hip: {derived['waist_to_hip']:.4f} | sh_wa: {derived['shoulder_to_waist']:.4f} | torso_aspect: {derived['torso_aspect']:.4f} | waist_def: {derived['waist_definition']:.4f}")

    print("\n=== MALE REFERENCE IMAGES ===")
    for shape, path in male_images.items():
        if not os.path.exists(path):
            continue
        img = cv2.imread(path)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        named, raw, mask = lm_mod.extract(img_rgb)
        derived = feat_mod.derive(named, mask)
        print(f"Shape: {shape:<18} | sh_hip: {derived['shoulder_to_hip']:.4f} | wa_hip: {derived['waist_to_hip']:.4f} | sh_wa: {derived['shoulder_to_waist']:.4f} | torso_aspect: {derived['torso_aspect']:.4f} | waist_def: {derived['waist_definition']:.4f}")

if __name__ == "__main__":
    test_features()
