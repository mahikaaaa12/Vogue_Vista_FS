import os

root_dir = r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Body_backend"

def find_py_files():
    for root, dirs, files in os.walk(root_dir):
        if "node_modules" in root or ".git" in root or "__pycache__" in root or "env" in root:
            continue
        for file in files:
            if file.endswith(".py"):
                path = os.path.join(root, file)
                rel_path = os.path.relpath(path, root_dir)
                print(f"  {rel_path} ({os.path.getsize(path)} bytes)")

if __name__ == "__main__":
    find_py_files()
