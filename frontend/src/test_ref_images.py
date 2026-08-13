import os
from body_analysis.ml import pipeline

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

def audit():
    print("=== AUDITING FEMALE REFERENCE IMAGES ===")
    for expected, path in female_images.items():
        if not os.path.exists(path):
            print(f"Skipping {expected} (file not found at {path})")
            continue
        try:
            res = pipeline.run(path, gender="female")
            pred = res["predicted_shape"]
            conf = res["confidence"]
            sh_hip = res["features"]["shoulder_to_hip"]
            wa_hip = res["features"]["waist_to_hip"]
            sh_wa = res["features"]["shoulder_to_waist"]
            print(f"Expected: {expected:<18} | Predicted: {pred:<18} | Conf: {conf:.4f} | sh_hip: {sh_hip:.4f}, wa_hip: {wa_hip:.4f}, sh_wa: {sh_wa:.4f} | {'PASS' if expected == pred else 'FAIL'}")
        except Exception as e:
            print(f"Error on {expected}: {e}")

    print("\n=== AUDITING MALE REFERENCE IMAGES ===")
    for expected, path in male_images.items():
        if not os.path.exists(path):
            print(f"Skipping {expected} (file not found at {path})")
            continue
        try:
            res = pipeline.run(path, gender="male")
            pred = res["predicted_shape"]
            conf = res["confidence"]
            sh_hip = res["features"]["shoulder_to_hip"]
            wa_hip = res["features"]["waist_to_hip"]
            sh_wa = res["features"]["shoulder_to_waist"]
            print(f"Expected: {expected:<18} | Predicted: {pred:<18} | Conf: {conf:.4f} | sh_hip: {sh_hip:.4f}, wa_hip: {wa_hip:.4f}, sh_wa: {sh_wa:.4f} | {'PASS' if expected == pred else 'FAIL'}")
        except Exception as e:
            print(f"Error on {expected}: {e}")

audit()
