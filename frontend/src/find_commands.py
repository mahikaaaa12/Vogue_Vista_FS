import os

root_dir = r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Vogue_Vista_FS"

def search():
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file in ["prepare_dataset.py", "train_shape_model.py"]:
                print(os.path.join(root, file))

if __name__ == "__main__":
    search()
