with open(r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Vogue_Vista_FS\backend\body_analysis\ml\classifier.py", "r", encoding="utf-8") as f:
    for i, line in enumerate(f, 1):
        if "BASE_DIR" in line:
            print(f"Line {i}: {line.strip()}")
