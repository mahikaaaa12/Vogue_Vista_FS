import numpy as np
from ..shared.preprocessing import extract_center_roi, normalize_color_space

class SkinColorDetector:
    """
    OpenCV Skin Matrix Color Detector.
    Strictly isolated from body_models.
    """
    def __init__(self):
        pass

    def analyze_undertone(self, image_bgr):
        if image_bgr is None:
            return "Cool", "Fair", 150.0

        roi = extract_center_roi(image_bgr)
        rgb, hsv = normalize_color_space(roi if roi is not None else image_bgr)
        
        r_avg = float(np.mean(rgb[:,:,0]))
        g_avg = float(np.mean(rgb[:,:,1]))
        b_avg = float(np.mean(rgb[:,:,2]))
        val = float(np.mean(hsv[:,:,2]))

        rb_diff = r_avg - b_avg
        bg_ratio = b_avg / (g_avg + 1e-6)

        if rb_diff > 65 and bg_ratio < 0.85:
            undertone = "Warm"
        elif rb_diff < 52 or bg_ratio > 0.88:
            undertone = "Cool"
        else:
            undertone = "Neutral"

        if val > 180:
            skin_tone = "Fair"
        elif val > 120:
            skin_tone = "Medium"
        else:
            skin_tone = "Deep"

        return undertone, skin_tone, val
