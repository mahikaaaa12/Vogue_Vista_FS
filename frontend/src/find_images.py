import os

root_dir = r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Vogue_Vista_FS"

def find_images():
    extensions = (".png", ".jpg", ".jpeg", ".webp")
    for root, dirs, files in os.walk(root_dir):
        if "node_modules" in root or ".git" in root or ".gemini" in root:
            continue
        for file in files:
            if file.lower().endswith(extensions):
                path = os.path.join(root, file)
                # Print relative path from root_dir safely
                rel_path = os.path.relpath(path, root_dir)
                try:
                    print(f"Image: {rel_path} ({os.path.getsize(path)} bytes)")
                except Exception:
                    print(f"Image: <unicode filename>")

if __name__ == "__main__":
    find_images()
