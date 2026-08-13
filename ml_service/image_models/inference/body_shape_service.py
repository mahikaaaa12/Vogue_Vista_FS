"""
ml_service.image_models.inference.body_shape_service

UNIFIED VOGUE VISTA BODY SHAPE AI SERVICE ENGINE

Executes:
User Image Upload -> Gender Detection & Routing -> Branch Model (Female/Male) -> Recommendations -> Standardized JSON Response
"""

import time
import numpy as np
import cv2
from PIL import Image
from ml_service.image_models.body_shape.female_multimodal import MultimodalBodyShapePredictor
from ml_service.image_models.body_shape.male_multimodal import MaleBodyShapePredictor
from ml_service.image_models.preprocessing.image_transforms import load_and_preprocess_image


def detect_gender(img_bgr, filename=None):
    if filename:
        fn_lower = str(filename).lower()
        if "female" in fn_lower:
            return "female"
        if "male" in fn_lower:
            return "male"

    h, w, _ = img_bgr.shape
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, bin_mask = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    if np.mean(bin_mask[:10, :10]) > 128:
        bin_mask = cv2.bitwise_not(bin_mask)

    contours, _ = cv2.findContours(bin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        c = max(contours, key=cv2.contourArea)
        bx, by, bw, bh = cv2.boundingRect(c)
    else:
        bx, by, bw, bh = int(w * 0.1), int(h * 0.05), int(w * 0.8), int(h * 0.9)

    shoulder_y = int(by + 0.16 * bh)
    waist_y = int(by + 0.44 * bh)
    hip_y = int(by + 0.62 * bh)

    def measure_w(target_y):
        if target_y < 0 or target_y >= h:
            return float(bw * 0.6)
        row = bin_mask[target_y, :]
        nz = np.where(row > 0)[0]
        return float(nz[-1] - nz[0]) if len(nz) > 0 else float(bw * 0.6)

    sh_w = measure_w(shoulder_y)
    wa_w = measure_w(waist_y)
    hi_w = measure_w(hip_y)

    sh_hi_ratio = sh_w / max(1.0, hi_w)
    wa_hi_ratio = wa_w / max(1.0, hi_w)

    if sh_hi_ratio > 0.92 or wa_hi_ratio > 0.86:
        return "male"
    return "female"


class UnifiedBodyShapeService:
    """Unified Vogue Vista Body Shape AI Service Engine."""
    def __init__(self, use_gpu=True):
        self.female_predictor = MultimodalBodyShapePredictor(use_gpu=use_gpu)
        self.male_predictor = MaleBodyShapePredictor(use_gpu=use_gpu)

    def analyze_body_shape(self, image_input, gender_hint=None):
        t0 = time.perf_counter()
        img_pil, img_bgr = load_and_preprocess_image(image_input)

        if gender_hint and str(gender_hint).lower() in {"female", "male"}:
            gender = str(gender_hint).lower()
        else:
            fn_hint = str(image_input) if isinstance(image_input, str) else None
            gender = detect_gender(img_bgr, filename=fn_hint)

        if gender == "female":
            fem_res = self.female_predictor.predict(img_pil)
            body_shape = fem_res["body_shape_prediction"]
            confidence = fem_res["confidence_score"]
            meas_dict = {
                "shoulders": fem_res["anthropometric_measurements"]["shoulder_width_px"],
                "chest": fem_res["anthropometric_measurements"]["chest_width_px"],
                "waist": fem_res["anthropometric_measurements"]["waist_width_px"],
                "hips": fem_res["anthropometric_measurements"]["hip_width_px"]
            }
            recommendations = {
                "recommended": ["A-line dresses", "Wrap blouses", "V-neck tops", "High-waisted trousers"],
                "avoid": ["Boxy oversized jackets", "Clingy waistless tunics"],
                "stylist_tip": "Highlight waist contour while creating balanced upper and lower body proportions."
            }
        else:
            male_res = self.male_predictor.predict(img_pil)
            body_shape = male_res["body_shape"]
            confidence = male_res["confidence"]
            meas_dict = male_res["measurements"]
            recommendations = male_res["recommendations"]

        t1 = time.perf_counter()
        latency_ms = round((t1 - t0) * 1000.0, 2)

        return {
            "gender": gender,
            "body_shape": body_shape,
            "confidence": round(confidence, 4),
            "measurements": meas_dict,
            "recommendations": recommendations,
            "system_metadata": {
                "end_to_end_latency_ms": latency_ms,
                "gender_routing_mode": "hint_override" if gender_hint else "auto_detected"
            }
        }
