import os

root_dirs = [
    r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Vogue_Vista_FS\backend\body_analysis",
    r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Vogue_Vista_FS\ml_service"
]

def find_py_files():
    for root_dir in root_dirs:
        print(f"=== Root: {root_dir} ===")
        for root, dirs, files in os.walk(root_dir):
            if "node_modules" in root or ".git" in root or "__pycache__" in root:
                continue
            for file in files:
                if file.endswith(".py"):
                    path = os.path.join(root, file)
                    rel_path = os.path.relpath(path, root_dir)
                    print(f"  {rel_path} ({os.path.getsize(path)} bytes)")

if __name__ == "__main__":
    find_py_files()
