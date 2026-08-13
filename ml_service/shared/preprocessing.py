import numpy as np
import cv2

def decode_image_bytes(image_bytes):
    """Decodes raw byte stream into an OpenCV BGR image matrix."""
    if image_bytes is None:
        return None
    nparr = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

def extract_center_roi(image, start_ratio=0.4, end_ratio=0.6):
    """Extracts central region of interest from an image matrix."""
    if image is None:
        return None
    h, w = image.shape[:2]
    return image[int(h * start_ratio):int(h * end_ratio), int(w * start_ratio):int(w * end_ratio)]

def normalize_color_space(image_bgr):
    """Transforms BGR image to RGB and HSV color spaces."""
    if image_bgr is None:
        return None, None
    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    hsv = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2HSV)
    return rgb, hsv
