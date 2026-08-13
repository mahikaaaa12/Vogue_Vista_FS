with open(r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Vogue_Vista_FS\backend\body_analysis\ml\measurements.py", "r", encoding="utf-8") as f:
    for i in range(40):
        line = f.readline()
        if not line:
            break
        print(f"{i+1:2d}: {repr(line)}")
