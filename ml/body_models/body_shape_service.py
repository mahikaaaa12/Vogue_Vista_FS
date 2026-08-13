#!/usr/bin/env python3
"""
body_shape_service.py

Root entrypoint for unified Body Shape AI service engine.
"""

from ml_service.image_models.inference.body_shape_service import UnifiedBodyShapeService, detect_gender

if __name__ == "__main__":
    import json
    from pathlib import Path
    
    service = UnifiedBodyShapeService()
    sample_fem = "ml_models/image_body_shape/dataset/master_dataset/female/apple/female_apple_001.jpg"
    if not Path(sample_fem).exists():
        sample_fem = list(Path(".").glob("*.jpg"))[0]
        
    res = service.analyze_body_shape(sample_fem)
    print(json.dumps(res, indent=4))
