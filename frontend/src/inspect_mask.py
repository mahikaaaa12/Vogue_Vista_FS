import os
import sys

sys.path.append(r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Vogue_Vista_FS")

from ml_service.image_models.feature_extraction import landmarks as lm_mod
import cv2
import numpy as np

image_path = r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Body_backend\reference_library\female\hourglass\ref_female_hourglass.jpg"

def inspect_mask():
    if not os.path.exists(image_path):
        print("Image not found")
        return
    
    img = cv2.imread(image_path)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    try:
        named, raw, mask = lm_mod.extract(img_rgb)
    except Exception as e:
        print(f"Extraction failed: {e}")
        return
        
    if mask is None:
        print("No segmentation mask")
        return
        
    print("Mask shape:", mask.shape)
    print("Mask dtype:", mask.dtype)
    print("Mask min/max:", np.min(mask), np.max(mask))
    
    h, w = mask.shape[:2]
    row_idx = int(0.55 * h)
    row = mask[row_idx, :]
    print("Row shape:", row.shape)
    print("Row values > 0 count:", np.sum(row > 0))
    print("Row values > 0.5 count:", np.sum(row > 0.5))
    print("Row values > 0.9 count:", np.sum(row > 0.9))
    print("Total columns:", w)

inspect_mask()
