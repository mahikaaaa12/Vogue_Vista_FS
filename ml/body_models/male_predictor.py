#!/usr/bin/env python3
"""
male_predictor.py

Root entrypoint for production male predictor class.
"""

from ml_service.image_models.body_shape.male_multimodal import MaleBodyShapePredictor

if __name__ == "__main__":
    import json
    from pathlib import Path
    
    predictor = MaleBodyShapePredictor()
    sample_img = "multimodal_male_dataset/male/inverted_triangle/male_inverted_triangle_001.jpg"
    if not Path(sample_img).exists():
        sample_img = list(Path(".").glob("*.jpg"))[0]
        
    res = predictor.predict(sample_img)
    print(json.dumps(res, indent=4))
