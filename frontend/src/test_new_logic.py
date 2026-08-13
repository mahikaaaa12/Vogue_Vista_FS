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

# New proposed _mask_width function
def proposed_mask_width(mask, target_y_norm: float, center_x_norm: float) -> float | None:
    if mask is None:
        return None
    h, w = mask.shape[:2]
    row_idx = int(max(0.0, min(0.999, target_y_norm)) * h)
    # Threshold at 0.5
    row = mask[row_idx, :] > 0.5
    
    # Midline column
    center_col = int(max(0.0, min(0.999, center_x_norm)) * w)
    
    # Find the continuous segment containing center_col
    true_indices = np.where(row)[0]
    if len(true_indices) == 0:
        return None
        
    if not row[center_col]:
        # Fallback: find closest true pixel
        center_col = true_indices[np.argmin(np.abs(true_indices - center_col))]
        
    start = center_col
    while start > 0 and row[start - 1]:
        start -= 1
    end = center_col
    while end < w - 1 and row[end + 1]:
        end += 1
        
    return float((end - start) / float(w))

def proposed_estimate_waist(mask, shoulder_mid, hip_mid, fallback: float) -> float:
    if mask is None:
        return float(fallback)
    h, w = mask.shape[:2]
    start_y = int(max(0.0, min(0.999, shoulder_mid[1])) * h)
    end_y = int(max(0.0, min(0.999, hip_mid[1])) * h)
    if end_y <= start_y + 2:
        return float(fallback)

    # Walk through rows, extract proposed mask width, find min
    center_x = (shoulder_mid[0] + hip_mid[0]) / 2.0
    widths = []
    for y_idx in range(start_y, end_y):
        y_norm = y_idx / float(h)
        wd = proposed_mask_width(mask, y_norm, center_x)
        if wd is not None:
            widths.append(wd)
            
    if not widths:
        return float(fallback)
    return float(np.min(widths))

# Override in memory
feat_mod._mask_width = proposed_mask_width
feat_mod._estimate_waist = proposed_estimate_waist

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
