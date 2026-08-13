import os

root_dir = r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Body_backend"

def find_csv():
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.lower().endswith(".csv"):
                path = os.path.join(root, file)
                print(path, os.path.getsize(path))

if __name__ == "__main__":
    find_csv()
