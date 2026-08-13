import csv

csv_path = r"c:\Users\Mahika\OneDrive\Desktop\Workspace\Body_backend\reference_library\reference_measurements.csv"

with open(csv_path, "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    for row in reader:
        print(", ".join(row))
