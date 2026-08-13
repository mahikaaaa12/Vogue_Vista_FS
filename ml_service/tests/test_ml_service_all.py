"""
test_ml_service_all.py

Comprehensive Validation and Unit Test Suite for ml_service Package.
"""

import unittest
from pathlib import Path
import numpy as np
from PIL import Image

from ml_service.shared.config import MLConfig
from ml_service.shared.constants import FEMALE_CLASSES, MALE_CLASSES
from ml_service.shared.logger import get_logger
from ml_service.shared.model_loader import ModelLoader
from ml_service.measurement_models.inference.predictor import BodyShapePredictor as MeasurementPredictor
from ml_service.measurement_models.classifiers.classifier import predict as predict_measurement_shape
from ml_service.image_models.inference.body_shape_service import UnifiedBodyShapeService
from ml_service.image_models.color_analysis.color_season import analyze_color_season
from ml_service.image_models.color_analysis.skin_tone import extract_skin_tone
from ml_service.image_models.undertone.undertone_detector import detect_undertone
from ml_service.image_models.face_shape.face_shape_detector import detect_face_shape

logger = get_logger("TestMLService")


class TestMLService(unittest.TestCase):

    def setUp(self):
        self.loader = ModelLoader()

    def test_model_loader_singleton(self):
        loader2 = ModelLoader()
        self.assertIs(self.loader, loader2)

    def test_measurement_predictor(self):
        predictor = MeasurementPredictor()
        input_data = {
            "gender": "female",
            "shoulder": 110.0,
            "waist": 70.0,
            "hip": 105.0,
            "torso": 45.0
        }
        res = predictor.predict(input_data)
        self.assertIn("body_shape", res)
        self.assertIn("confidence", res)
        self.assertGreater(res["confidence"], 0.0)

    def test_measurement_classifier_fallback(self):
        res = predict_measurement_shape({"shoulder_to_hip": 1.10, "waist_to_hip": 0.80}, gender="male")
        self.assertIn("predicted_shape", res)
        self.assertEqual(res["predicted_shape"], "inverted_triangle")

    def test_color_analysis_and_undertone(self):
        color_res = analyze_color_season((220, 180, 150), (40, 30, 20), (50, 40, 30))
        self.assertIn("season", color_res)

        skin_res = extract_skin_tone(np.full((50, 50, 3), 200, dtype=np.uint8))
        self.assertIn("hex", skin_res)

        undertone_res = detect_undertone((210, 170, 140))
        self.assertIn("undertone", undertone_res)

    def test_face_shape_detector(self):
        face_res = detect_face_shape([])
        self.assertIn("face_shape", face_res)
        self.assertEqual(face_res["face_shape"], "Oval")

    def test_unified_body_shape_service(self):
        service = UnifiedBodyShapeService(use_gpu=False)
        img = Image.new("RGB", (640, 640), color=(200, 200, 200))
        res = service.analyze_body_shape(img, gender_hint="female")
        self.assertEqual(res["gender"], "female")
        self.assertIn("body_shape", res)
        self.assertIn("recommendations", res)


if __name__ == "__main__":
    unittest.main()
