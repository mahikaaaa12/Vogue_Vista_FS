import os

ml_dir = r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Body_backend\voguevista\apps\analysis\ml"

for root, dirs, files in os.walk(ml_dir):
    for file in files:
        if file.endswith(".py"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                for i, line in enumerate(f, 1):
                    if "BASE_DIR" in line:
                        print(f"{os.path.relpath(path, ml_dir)}:L{i}: {line.strip()}")
