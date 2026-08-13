import os

root_dir = r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Vogue_Vista_FS\backend\body_analysis"

def search():
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".py"):
                path = os.path.join(root, file)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        content = f.read()
                        if "measurements" in content:
                            print(f"Match: {path}")
                except Exception:
                    pass

if __name__ == "__main__":
    search()
