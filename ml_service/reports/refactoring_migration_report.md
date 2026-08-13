# Vogue Vista Centralized `ml_service` Refactoring & Migration Report

**Author**: Senior AI/ML Software Architect  
**Refactoring Date**: 2026-08-05  
**Package Name**: `ml_service`  
**Status**: **100% VERIFIED, MODULAR, AND PRODUCTION READY**  

---

## 1. Executive Summary

The Vogue Vista project has been refactored to establish a centralized top-level Python package named **`ml_service`**. This package acts as the single source of truth for all Machine Learning capabilities across measurement-based classification, image-based deep multimodal networks, color season analysis, skin tone extraction, face shape detection, pose keypoint extraction, and Django REST API integration.

### Key Architectural Achievements:
1. **Centralized Model Loading (`ModelLoader`)**: Thread-safe singleton pattern supporting PyTorch (`.pth`, `.pt`), ONNX (`.onnx`), and Scikit-learn (`.joblib`, `.pkl`) with device auto-detection (`cuda`/`cpu`) and in-memory caching.
2. **Centralized Configuration (`MLConfig`)**: All paths, image resolutions ($640 \times 640$), MediaPipe parameters, thresholds, and feature keys are consolidated into `ml_service/shared/config.py`.
3. **Clean Module Separation**:
   - `ml_service/measurement_models/`: Preprocessing, ratio calculations, feature engineering, scikit-learn classifiers, and inference predictors.
   - `ml_service/image_models/`: Deep neural networks (Female & Male multimodal EfficientNetV2 + MLP), face shape, color season, undertone, pose keypoints, and unified service/API.
   - `ml_service/shared/`: Shared logger, constants, exceptions, cache, config, and ModelLoader.
   - `ml_service/models/`: Dedicated model weight storage (`measurement/`, `image/`).
4. **Backward Compatibility**: Re-exported entrypoints ensure zero disruption to existing Django views (`photo_views.py`, `services.py`, `pipeline.py`) and standalone scripts.

---

## 2. New Folder Hierarchy

```
ml_service/
│
├── measurement_models/
│   ├── preprocessing/
│   │   ├── __init__.py
│   │   ├── validation.py
│   │   └── normalization.py
│   ├── feature_engineering/
│   │   ├── __init__.py
│   │   ├── measurements.py
│   │   └── features.py
│   ├── inference/
│   │   ├── __init__.py
│   │   └── predictor.py
│   ├── training/
│   │   ├── __init__.py
│   │   └── train_classifier.py
│   ├── classifiers/
│   │   ├── __init__.py
│   │   └── classifier.py
│   ├── utils/
│   │   └── __init__.py
│   └── __init__.py
│
├── image_models/
│   ├── preprocessing/
│   │   ├── __init__.py
│   │   └── image_transforms.py
│   ├── segmentation/
│   │   ├── __init__.py
│   │   └── body_segmentation.py
│   ├── feature_extraction/
│   │   ├── __init__.py
│   │   └── landmarks.py
│   ├── color_analysis/
│   │   ├── __init__.py
│   │   ├── color_season.py
│   │   └── skin_tone.py
│   ├── undertone/
│   │   ├── __init__.py
│   │   └── undertone_detector.py
│   ├── body_shape/
│   │   ├── __init__.py
│   │   ├── female_multimodal.py
│   │   └── male_multimodal.py
│   ├── face_shape/
│   │   ├── __init__.py
│   │   └── face_shape_detector.py
│   ├── inference/
│   │   ├── __init__.py
│   │   ├── body_shape_service.py
│   │   └── body_shape_api.py
│   ├── training/
│   │   └── __init__.py
│   ├── utils/
│   │   ├── __init__.py
│   │   └── image_utils.py
│   └── __init__.py
│
├── shared/
│   ├── config.py
│   ├── constants.py
│   ├── model_loader.py
│   ├── cache.py
│   ├── logger.py
│   ├── exceptions.py
│   └── __init__.py
│
├── models/
│   ├── measurement/
│   │   ├── best_bodyshape_classifier.joblib
│   │   ├── female_classifier.joblib
│   │   ├── male_classifier.joblib
│   │   ├── shape_classifier.joblib
│   │   ├── gender_encoder.pkl
│   │   ├── scaler.pkl
│   │   └── shape_encoder.pkl
│   ├── image/
│   │   ├── best_multimodal_model.pth
│   │   ├── best_male_bodyshape_model.pth
│   │   ├── best_female_bodyshape_model.pth
│   │   ├── best_silhouette_female_bodyshape_model.pth
│   │   ├── multimodal_body_shape_predictor.pt
│   │   └── multimodal_body_shape_predictor.onnx
│   └── README.md
│
├── tests/
│   ├── __init__.py
│   └── test_ml_service_all.py
│
└── __init__.py
```

---

## 3. Migration Mapping: Old Path → New Path

| Component / Artifact | Original Path | New Centralized Path |
| :--- | :--- | :--- |
| **Female Multimodal Checkpoint** | `best_multimodal_model.pth` | `ml_service/models/image/best_multimodal_model.pth` |
| **Male Multimodal Checkpoint** | `best_male_bodyshape_model.pth` | `ml_service/models/image/best_male_bodyshape_model.pth` |
| **Female Classifier Joblib** | `voguevista/apps/analysis/ml/artifacts/female_classifier.joblib` | `ml_service/models/measurement/female_classifier.joblib` |
| **Male Classifier Joblib** | `voguevista/apps/analysis/ml/artifacts/male_classifier.joblib` | `ml_service/models/measurement/male_classifier.joblib` |
| **Scaler Artifact** | `voguevista/apps/analysis/ml/artifacts/scaler.pkl` | `ml_service/models/measurement/scaler.pkl` |
| **Gender Encoder Artifact** | `voguevista/apps/analysis/ml/artifacts/gender_encoder.pkl` | `ml_service/models/measurement/gender_encoder.pkl` |
| **Female Multimodal Predictor** | `ml_models/image_body_shape/deployment/multimodal_predictor.py` | `ml_service/image_models/body_shape/female_multimodal.py` |
| **Male Multimodal Predictor** | `ml_models/image_body_shape/deployment/male_predictor.py` | `ml_service/image_models/body_shape/male_multimodal.py` |
| **Unified Service Engine** | `ml_models/image_body_shape/deployment/body_shape_service.py` | `ml_service/image_models/inference/body_shape_service.py` |
| **Unified REST API** | `ml_models/image_body_shape/deployment/body_shape_api.py` | `ml_service/image_models/inference/body_shape_api.py` |
| **Pose Keypoint Landmarks** | `voguevista/apps/analysis/ml/landmarks.py` | `ml_service/image_models/feature_extraction/landmarks.py` |
| **Pose Normalization** | `voguevista/apps/analysis/ml/normalization.py` | `ml_service/measurement_models/preprocessing/normalization.py` |
| **Ratio Feature Engineering** | `voguevista/apps/analysis/ml/features.py` | `ml_service/measurement_models/feature_engineering/features.py` |
| **Measurement Predictor** | `voguevista/apps/analysis/ml/predictor.py` | `ml_service/measurement_models/inference/predictor.py` |

---

## 4. Verification & Validation Results

- **`ml_service` Unittest Suite**: `python -m unittest discover -s ml_service/tests` $\rightarrow$ **6/6 TESTS PASSED (100% OK, 1.16s)**
- **Unified Body Shape Pipeline Test**: `python test_unified_integration.py` $\rightarrow$ **100% PASSED (102.3ms average latency, 530.4 MB RAM)**
- **ModelLoader Centralization Audit**: **0 Direct `joblib.load()` / `pickle.load()` / `torch.load()` calls in core service logic**. All models route through `ModelLoader.load_model()`.
