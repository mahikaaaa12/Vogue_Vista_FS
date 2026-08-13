import os

root_dir = r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Body_backend"

def search():
    keywords = ["reference_measurements.csv", "ref_female_hourglass.jpg"]
    for root, dirs, files in os.walk(root_dir):
        if "node_modules" in root or ".git" in root or "__pycache__" in root or "env" in root:
            continue
        for file in files:
            if file.endswith((".py", ".json", ".csv", ".yaml", ".sh", ".bat")):
                path = os.path.join(root, file)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        content = f.read()
                        matches = [kw for kw in keywords if kw in content]
                        if matches:
                            print(f"Match: {path} - keywords: {matches}")
                except Exception:
                    pass

if __name__ == "__main__":
    search()
