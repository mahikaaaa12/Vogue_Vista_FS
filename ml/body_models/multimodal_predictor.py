#!/usr/bin/env python3
"""
multimodal_predictor.py

Root entrypoint for production Python Predictor class.
"""

from ml_service.image_models.body_shape.female_multimodal import MultimodalBodyShapePredictor

if __name__ == "__main__":
    import sys
    import json
    from pathlib import Path
    
    predictor = MultimodalBodyShapePredictor()
    sample_img = "ml_models/image_body_shape/dataset/master_dataset/female/apple/female_apple_001.jpg"
    if not Path(sample_img).exists():
        sample_img = list(Path(".").glob("*.jpg"))[0]
        
    res = predictor.predict(sample_img)
    print(json.dumps(res, indent=4))
