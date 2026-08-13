with open(r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Body_backend\voguevista\apps\analysis\ml\classifier.py", "r", encoding="utf-8") as f:
    for i, line in enumerate(f, 1):
        if "BASE_DIR" in line:
            print(f"Line {i}: {line.strip()}")
