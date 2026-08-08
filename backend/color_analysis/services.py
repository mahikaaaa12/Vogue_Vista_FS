import uuid
import cv2
import numpy as np
from .palette_data import PALETTE_DATA

def process_color_analysis(image_bytes):
    if image_bytes is None:
        season = "Winter"
        data = PALETTE_DATA[season]
        return {
            "id": str(uuid.uuid4())[:8],
            "undertone": "Cool",
            "skin_tone": "Fair",
            "season": season,
            "cheesy": data["cheesy"],
            "signature_title": data["signature_name"],
            "signature_desc": data["signature_desc"],
            "metal_title": data["metal_title"],
            "metal_desc": data["metal_desc"],
            "metal_glow": data["metal_glow"],
            "hair_title": data["hair_title"],
            "hair_desc": data["hair_desc"],
            "hair_glow": data["hair_glow"],
            "metal_swatches": data["metal_swatches"],
            "hair_swatches": data["hair_swatches"],
            "palette": data["glow_colors"],
            "universal_colors": data["universal_colors"],
            "avoid_colors": data["avoid_colors"],
            "recommendations": [c["name"] for c in data["glow_colors"][:4]]
        }

    file_bytes = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Corrupted or invalid image structure.")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

    if len(faces) > 0:
        x, y, w, h = faces[0]
        raw_roi = img[y + int(h * 0.45) : y + int(h * 0.65), x + int(w * 0.4) : x + int(w * 0.6)]
    else:
        height, width = img.shape[:2]
        raw_roi = img[int(height * 0.4) : int(height * 0.6), int(width * 0.4) : int(width * 0.6)]

    blurred_roi = cv2.medianBlur(raw_roi, 5)
    hsv_roi = cv2.cvtColor(blurred_roi, cv2.COLOR_BGR2HSV)
    h_channel, s_channel, v_channel = cv2.split(hsv_roi)
    valid_mask = (v_channel > 50) & (v_channel < 220) & (s_channel > 20)
    rgb_roi = cv2.cvtColor(blurred_roi, cv2.COLOR_BGR2RGB)

    if np.any(valid_mask):
        r_avg = float(np.mean(rgb_roi[:,:,0][valid_mask]))
        g_avg = float(np.mean(rgb_roi[:,:,1][valid_mask]))
        b_avg = float(np.mean(rgb_roi[:,:,2][valid_mask]))
        val = float(np.mean(v_channel[valid_mask]))
    else:
        r_avg, g_avg, b_avg = [float(x) for x in cv2.mean(rgb_roi)[:3]]
        val = float(np.mean(v_channel))

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

    if undertone == "Cool" and skin_tone == "Fair":
        season = "Winter"
    elif undertone == "Cool":
        season = "Summer"
    elif undertone == "Warm" and skin_tone in ["Fair", "Medium"]:
        season = "Spring"
    else:
        season = "Autumn"

    data = PALETTE_DATA.get(season, PALETTE_DATA["Autumn"])

    return {
        "id": str(uuid.uuid4())[:8],
        "undertone": undertone,
        "skin_tone": skin_tone,
        "season": season,
        "cheesy": data["cheesy"],
        "signature_title": data["signature_name"],
        "signature_desc": data["signature_desc"],
        "metal_title": data["metal_title"],
        "metal_desc": data["metal_desc"],
        "metal_glow": data["metal_glow"],
        "hair_title": data["hair_title"],
        "hair_desc": data["hair_desc"],
        "hair_glow": data["hair_glow"],
        "metal_swatches": data["metal_swatches"],
        "hair_swatches": data["hair_swatches"],
        "palette": data["glow_colors"],
        "universal_colors": data["universal_colors"],
        "avoid_colors": data["avoid_colors"],
        "recommendations": [c["name"] for c in data["glow_colors"][:4]]
    }
