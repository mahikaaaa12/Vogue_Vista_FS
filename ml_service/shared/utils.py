import json
from pathlib import Path

def load_json_rules(file_path):
    """Safely loads a JSON configuration or rules file."""
    path = Path(file_path)
    if path.exists():
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def calculate_ratio(num, den):
    """Calculates anthropometric ratio with zero division protection."""
    if den == 0:
        return 1.0
    return round(float(num) / float(den), 3)
