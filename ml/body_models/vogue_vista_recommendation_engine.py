#!/usr/bin/env python3
"""
vogue_vista_recommendation_engine.py

Root entrypoint for Vogue Vista recommendation engine.
"""

from ml_models.image_body_shape.recommendation.vogue_vista_recommendation_engine import (
    VogueVistaRecommendationEngine,
    FASHION_KNOWLEDGE_BASE,
    CLASSES,
)

if __name__ == "__main__":
    import json
    engine = VogueVistaRecommendationEngine()
    rec = engine.generate_recommendation("hourglass", 0.85)
    print(json.dumps(rec, indent=4))
