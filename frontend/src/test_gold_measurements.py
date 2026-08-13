import os
import sys

# Add Body_backend to path so we can import its modules
sys.path.append(r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Body_backend")

import cv2
from pathlib import Path
import numpy as np

# Protobuf 4.x/5.x UPB compatibility patch for MediaPipe in Python 3.11
try:
    import google._upb._message
    if not hasattr(google._upb._message.FieldDescriptor, 'label'):
        google._upb._message.FieldDescriptor.label = property(lambda self: getattr(self, '_label', 1))
except Exception:
    pass

try:
    import google.protobuf.symbol_database
    import google.protobuf.message_factory
    if not hasattr(google.protobuf.symbol_database.SymbolDatabase, 'GetPrototype'):
        google.protobuf.symbol_database.SymbolDatabase.GetPrototype = lambda self, descriptor: google.protobuf.message_factory.GetMessageClass(descriptor)
except Exception:
    pass

import mediapipe as mp
from ml_models.image_body_shape.preprocessing.extract_body_measurements import measure_single_image, mp_pose

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

def test_gold():
    pose = mp_pose.Pose(
        static_image_mode=True,
        model_complexity=1,
        enable_segmentation=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    print("=== FEMALE REFERENCE IMAGES ===")
    for shape, path in female_images.items():
        if not os.path.exists(path):
            continue
        res = measure_single_image(Path(path), pose)
        if res["status"] == "Success":
            print(f"Shape: {shape:<18} | sh_hi: {res['shoulder_hip_ratio']:.4f} | wa_hi: {res['waist_hip_ratio']:.4f} | ch_wa: {res['chest_waist_ratio']:.4f} | sh: {res['shoulder_width']:.1f}, ch: {res['chest_width']:.1f}, wa: {res['waist_width']:.1f}, hi: {res['hip_width']:.1f}")
        else:
            print(f"Shape: {shape:<18} | Failed: {res.get('reason')}")

    print("\n=== MALE REFERENCE IMAGES ===")
    for shape, path in male_images.items():
        if not os.path.exists(path):
            continue
        res = measure_single_image(Path(path), pose)
        if res["status"] == "Success":
            print(f"Shape: {shape:<18} | sh_hi: {res['shoulder_hip_ratio']:.4f} | wa_hi: {res['waist_hip_ratio']:.4f} | ch_wa: {res['chest_waist_ratio']:.4f} | sh: {res['shoulder_width']:.1f}, ch: {res['chest_width']:.1f}, wa: {res['waist_width']:.1f}, hi: {res['hip_width']:.1f}")
        else:
            print(f"Shape: {shape:<18} | Failed: {res.get('reason')}")

    pose.close()

if __name__ == "__main__":
    test_gold()
