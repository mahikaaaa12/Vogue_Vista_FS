import os
import hashlib

ref_dir = r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Body_backend\reference_library"
img1 = os.path.join(ref_dir, "female", "hourglass", "ref_female_hourglass.jpg")
img2 = os.path.join(ref_dir, "female", "inverted_triangle", "ref_female_inverted_triangle.jpg")

def check():
    for img in [img1, img2]:
        if os.path.exists(img):
            with open(img, "rb") as f:
                h = hashlib.md5(f.read()).hexdigest()
            print(f"{os.path.basename(img)}: size={os.path.getsize(img)}, md5={h}")
        else:
            print(f"{img} does not exist")

check()
