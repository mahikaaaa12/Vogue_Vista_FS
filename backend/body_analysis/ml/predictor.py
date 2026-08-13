import os
import pickle
import joblib
import numpy as np

class BodyShapePredictor:
    """
    Unified predictor for body shape classification in Vogue Vista.
    Loads standard preprocessors and model weights from the artifacts directory.
    """
    def __init__(self, artifacts_dir=None):
        if artifacts_dir is None:
            # Resolve artifacts path relative to this file
            base_dir = os.path.dirname(os.path.abspath(__file__))
            artifacts_dir = os.path.join(base_dir, "artifacts")
            
        self.artifacts_dir = artifacts_dir
        
        # Load serialized components
        self.scaler_path = os.path.join(self.artifacts_dir, "scaler.pkl")
        self.gender_enc_path = os.path.join(self.artifacts_dir, "gender_encoder.pkl")
        self.shape_enc_path = os.path.join(self.artifacts_dir, "shape_encoder.pkl")
        self.model_path = os.path.join(self.artifacts_dir, "best_bodyshape_classifier.joblib")
        
        # self._load_components()

        from ml_service.shared import ModelLoader, MLConfig
        loader = ModelLoader()
        self.scaler = loader.load_model(MLConfig.SCALER_PATH)
        self.gender_encoder = loader.load_model(MLConfig.GENDER_ENCODER_PATH)
        self.shape_encoder = loader.load_model(MLConfig.SHAPE_ENCODER_PATH)
        self.model = loader.load_model(MLConfig.BEST_BODYSHAPE_CLASSIFIER_PATH)

    def predict(self, gender, shoulder_to_hip, waist_to_hip, shoulder_to_waist, 
                torso_aspect, symmetry=1.0, midline_offset=0.0):
        """
        Predicts the body shape given demographic and geometric features.
        
        Parameters:
        - gender: str ('female'/'male') or int/float (0/1)
        - shoulder_to_hip: float
        - waist_to_hip: float
        - shoulder_to_waist: float
        - torso_aspect: float
        - symmetry: float (default: 1.0)
        - midline_offset: float (default: 0.0)
        
        Returns:
        - dict containing prediction, confidence, and top 3 candidates.
        """
        # 1. Standardize/Encode Gender input
        if isinstance(gender, str):
            gender_clean = gender.strip().lower()
            try:
                encoded_gender = float(self.gender_encoder.transform([gender_clean])[0])
            except ValueError:
                # Fallback mapping if string is not in encoder vocabulary
                encoded_gender = 0.0 if "female" in gender_clean else 1.0
        else:
            encoded_gender = float(gender)  # Assume already encoded/numeric

        # 2. Scale numeric features
        numeric_vec = np.array([[
            float(shoulder_to_hip), float(waist_to_hip), float(shoulder_to_waist),
            float(torso_aspect), float(symmetry), float(midline_offset)
        ]], dtype=np.float32)
        
        scaled_numeric = self.scaler.transform(numeric_vec)

        # 3. Construct final 7D feature vector
        X = np.hstack([[[encoded_gender]], scaled_numeric])

        # 4. Predict probabilities
        y_probs = self.model.predict_proba(X)[0]
        
        # 5. Extract predicted class
        pred_idx = np.argmax(y_probs)
        predicted_shape = self.shape_encoder.inverse_transform([pred_idx])[0]
        confidence = float(y_probs[pred_idx])

        # 6. Extract Top 3 Probable shapes
        sorted_indices = np.argsort(y_probs)[::-1]
        top_3 = []
        for idx in sorted_indices[:3]:
            class_name = self.shape_encoder.inverse_transform([idx])[0]
            top_3.append({
                "shape": class_name,
                "confidence": float(y_probs[idx])
            })

        return {
            "predicted_shape": predicted_shape,
            "confidence": confidence,
            "top_3": top_3
        }

if __name__ == "__main__":
    # Self-test code
    try:
        predictor = BodyShapePredictor()
        print("Self-test: Predictor initialized successfully.")
        
        # Test a standard Hourglass profile
        test_out = predictor.predict(
            gender="female",
            shoulder_to_hip=1.0,
            waist_to_hip=0.7,
            shoulder_to_waist=1.43,
            torso_aspect=1.12,
            symmetry=1.0,
            midline_offset=0.0
        )
        print("\nTest Prediction Output:")
        import pprint
        pprint.pprint(test_out)
        
    except Exception as e:
        print(f"Self-test failed: {e}")
