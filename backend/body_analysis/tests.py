from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
import numpy as np

from body_analysis.ml.features import calculate_ratios
from body_analysis.ml.classifier import FEATURE_KEYS
from ml_service.shared.config import MLConfig
from ml_service.shared.model_loader import ModelLoader

class MeasurementAnalysisTests(APITestCase):

    def setUp(self):
        self.url = reverse("analysis-measurements")
        loader = ModelLoader()
        try:
            self.female_model = loader.load_model(MLConfig.FEMALE_CLASSIFIER_PATH)
        except Exception:
            self.female_model = None
        try:
            self.male_model = loader.load_model(MLConfig.MALE_CLASSIFIER_PATH)
        except Exception:
            self.male_model = None

    def test_valid_female_prediction(self):
        """Test prediction with valid female measurements."""
        payload = {
            "gender": "female",
            "shoulder": 40.0,
            "waist": 28.0,
            "hip": 40.0,
            "torso": 45.0,
            "unit": "cm"
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify standardized fields
        data = response.data
        self.assertIn("predicted_shape", data)
        self.assertIn("confidence", data)
        self.assertEqual(data["prediction_method"], "measurements")
        self.assertIn("model_name", data)
        self.assertEqual(data["gender"], "female")
        
        # Verify recommendation structure
        self.assertIn("recommendations", data)
        self.assertIn("proportions", data)
        self.assertIn("traits", data)

    def test_valid_male_prediction(self):
        """Test prediction with valid male measurements."""
        payload = {
            "gender": "male",
            "shoulder": 44.0,
            "waist": 32.0,
            "hip": 36.0,
            "torso": 48.0,
            "unit": "cm"
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data
        self.assertEqual(data["gender"], "male")
        self.assertIn("predicted_shape", data)
        self.assertEqual(data["prediction_method"], "measurements")

    def test_invalid_negative_values(self):
        """Test that negative measurements are rejected."""
        payload = {
            "gender": "female",
            "shoulder": -40.0,
            "waist": 28.0,
            "hip": 40.0,
            "torso": 45.0,
            "unit": "cm"
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("shoulder", response.data)

    def test_invalid_zero_values(self):
        """Test that zero measurements are rejected."""
        payload = {
            "gender": "male",
            "shoulder": 44.0,
            "waist": 0.0,
            "hip": 36.0,
            "torso": 48.0,
            "unit": "cm"
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("waist", response.data)

    def test_missing_required_fields(self):
        """Test that missing fields are rejected."""
        payload = {
            "gender": "female",
            "shoulder": 40.0,
            "waist": 28.0,
            # missing hip and torso
            "unit": "cm"
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("hip", response.data)
        self.assertIn("torso", response.data)

    def test_unit_independence(self):
        """Test that scaling measurements in inches vs cm yields the identical classification label."""
        payload_cm = {
            "gender": "female",
            "shoulder": 40.0,
            "waist": 30.0,
            "hip": 40.0,
            "torso": 45.0,
            "unit": "cm"
        }
        payload_inches = {
            "gender": "female",
            "shoulder": 15.748,
            "waist": 11.811,
            "hip": 15.748,
            "torso": 17.716,
            "unit": "inch"
        }
        
        res_cm = self.client.post(self.url, payload_cm, format="json")
        res_in = self.client.post(self.url, payload_inches, format="json")
        
        self.assertEqual(res_cm.status_code, status.HTTP_200_OK)
        self.assertEqual(res_in.status_code, status.HTTP_200_OK)
        
        self.assertEqual(res_cm.data["predicted_shape"], res_in.data["predicted_shape"])

    def test_ratio_calculation_formulas(self):
        """Test that calculate_ratios computes features using the correct mathematical formulas."""
        ratios = calculate_ratios(
            shoulder=40.0,
            waist=30.0,
            hip=40.0,
            torso=45.0,
            symmetry=1.0,
            midline_offset=0.0
        )
        
        self.assertAlmostEqual(ratios["shoulder_to_hip"], 1.0, places=4)
        self.assertAlmostEqual(ratios["waist_to_hip"], 0.75, places=4)
        self.assertAlmostEqual(ratios["shoulder_to_waist"], 1.3333, places=4)
        self.assertAlmostEqual(ratios["torso_aspect"], 1.125, places=4)
        self.assertEqual(ratios["symmetry"], 1.0)
        self.assertEqual(ratios["midline_offset"], 0.0)

    def test_feature_ordering_ml(self):
        """Test that FEATURE_KEYS contains exactly the 8 features expected by the training pipeline in correct order."""
        expected_keys = [
            "shoulder_to_hip",
            "waist_to_hip",
            "shoulder_to_waist",
            "chest_to_hip",
            "torso_aspect",
            "symmetry",
            "midline_offset",
            "waist_definition",
        ]
        self.assertEqual(FEATURE_KEYS, expected_keys)

    def test_correct_model_selection(self):
        """Test that the correct trained classifier pipeline steps are loaded for each gender."""
        if self.female_model is not None:
            female_step = self.female_model.steps[-1][1]
            self.assertEqual(female_step.__class__.__name__, "CalibratedClassifierCV")
        
        if self.male_model is not None:
            male_step = self.male_model.steps[-1][1]
            self.assertEqual(male_step.__class__.__name__, "CalibratedClassifierCV")
