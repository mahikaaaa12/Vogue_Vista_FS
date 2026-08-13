#!/usr/bin/env python3
"""
vogue_vista_male_recommendation_engine.py

Root entrypoint for male recommendation engine.
"""

from ml_models.image_body_shape.recommendation.vogue_vista_male_recommendation_engine import (
    VogueVistaMaleRecommendationEngine,
    MALE_FASHION_KNOWLEDGE_BASE,
    MALE_CLASSES,
)

if __name__ == "__main__":
    import json
    engine = VogueVistaMaleRecommendationEngine()
    rec = engine.generate_recommendation("inverted_triangle", 0.88)
    print(json.dumps(rec, indent=4))
