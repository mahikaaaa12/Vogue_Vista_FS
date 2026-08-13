# Vogue Vista Trained Models Repository

Centralized model storage for measurement-based ML classifiers and image-based deep neural networks.

## Directory Structure

```
models/
├── measurement/      # Scikit-Learn classifiers (.joblib, .pkl)
│   ├── best_bodyshape_classifier.joblib
│   ├── female_classifier.joblib
│   ├── male_classifier.joblib
│   ├── shape_classifier.joblib
│   ├── gender_encoder.pkl
│   ├── scaler.pkl
│   └── shape_encoder.pkl
├── image/            # PyTorch & ONNX checkpoints (.pth, .pt, .onnx)
│   ├── best_multimodal_model.pth
│   ├── best_male_bodyshape_model.pth
│   ├── best_female_bodyshape_model.pth
│   ├── best_silhouette_female_bodyshape_model.pth
│   ├── multimodal_body_shape_predictor.pt
│   └── multimodal_body_shape_predictor.onnx
└── README.md
```

## Model Loader Usage

All models MUST be loaded via the thread-safe `ModelLoader`:

```python
from ml_service.shared import ModelLoader, MLConfig

loader = ModelLoader()
classifier = loader.load_model(MLConfig.FEMALE_CLASSIFIER_PATH)
multimodal_net = loader.load_model(MLConfig.FEMALE_MODEL_PTH)
```
