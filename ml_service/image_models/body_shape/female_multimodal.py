"""
ml_service.image_models.body_shape.female_multimodal

Female Dual-Branch Multimodal Neural Network & Predictor Engine.
"""

import numpy as np
import cv2
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models as tv_models
from PIL import Image
from ml_service.shared.config import MLConfig
from ml_service.shared.constants import FEMALE_CLASSES, FEMALE_FEATURE_COLS
from ml_service.shared.model_loader import ModelLoader
from ml_service.image_models.preprocessing.image_transforms import get_eval_transforms


class FemaleMeasurementMLP(nn.Module):
    def __init__(self, input_dim=9, hidden_dim=64, embed_dim=128):
        super().__init__()
        self.mlp = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, embed_dim),
            nn.BatchNorm1d(embed_dim),
            nn.ReLU()
        )

    def forward(self, x):
        return self.mlp(x)


class DualBranchMultimodalNet(nn.Module):
    def __init__(self, num_classes=5, freeze_backbone=False):
        super().__init__()
        weights = tv_models.EfficientNet_V2_S_Weights.DEFAULT
        backbone = tv_models.efficientnet_v2_s(weights=weights)
        self.rgb_branch = backbone.features
        self.rgb_pool = nn.AdaptiveAvgPool2d(1)

        if freeze_backbone:
            for param in self.rgb_branch.parameters():
                param.requires_grad = False

        self.meas_branch = FemaleMeasurementMLP(input_dim=len(FEMALE_FEATURE_COLS), hidden_dim=64, embed_dim=128)

        rgb_embed_dim = 1280
        meas_embed_dim = 128
        fusion_dim = rgb_embed_dim + meas_embed_dim

        self.fusion_head = nn.Sequential(
            nn.BatchNorm1d(fusion_dim),
            nn.Dropout(p=0.3),
            nn.Linear(fusion_dim, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(p=0.2),
            nn.Linear(256, num_classes)
        )

    def forward(self, rgb_img, meas_vec):
        rgb_feat = self.rgb_branch(rgb_img)
        rgb_feat = self.rgb_pool(rgb_feat)
        rgb_embed = torch.flatten(rgb_feat, 1)
        meas_embed = self.meas_branch(meas_vec)
        fused = torch.cat([rgb_embed, meas_embed], dim=1)
        logits = self.fusion_head(fused)
        return logits


class MultimodalBodyShapePredictor:
    """Production Predictor Engine for Female Body Shape Analysis."""
    def __init__(self, model_path=None, use_gpu=True):
        self.loader = ModelLoader()
        self.device = torch.device(self.loader.device if use_gpu else "cpu")
        self.classes = FEMALE_CLASSES

        self.model = DualBranchMultimodalNet(num_classes=len(self.classes), freeze_backbone=False).to(self.device)

        if model_path is None:
            model_path = MLConfig.FEMALE_MODEL_PTH

        try:
            state_dict = self.loader.load_model(model_path, model_type="pytorch")
            if isinstance(state_dict, dict) and "state_dict" in state_dict:
                state_dict = state_dict["state_dict"]
            self.model.load_state_dict(state_dict, strict=False)
        except Exception:
            pass

        self.model.eval()
        self.transform = get_eval_transforms()

        self.scaler_mean = np.array([214.3, 198.5, 175.2, 192.4, 210.6, 260.1, 1.11, 0.91, 1.13], dtype=np.float32)
        self.scaler_std = np.array([32.5, 28.4, 24.6, 27.8, 30.1, 35.2, 0.15, 0.12, 0.16], dtype=np.float32)

    def predict(self, img_pil: Image.Image) -> dict:
        img_bgr = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
        meas_raw = self._extract_measurements(img_bgr)
        meas_norm = (meas_raw - self.scaler_mean) / (self.scaler_std + 1e-6)

        rgb_tensor = self.transform(img_pil).unsqueeze(0).to(self.device)
        meas_tensor = torch.tensor(meas_norm, dtype=torch.float32).unsqueeze(0).to(self.device)

        with torch.no_grad():
            logits = self.model(rgb_tensor, meas_tensor)
            probs = F.softmax(logits, dim=1).cpu().numpy()[0]

        top_idx = int(np.argmax(probs))
        shape_pred = self.classes[top_idx]
        conf_score = float(probs[top_idx])

        top3_indices = np.argsort(probs)[-3:][::-1]
        top3_candidates = [
            {"body_shape": self.classes[i], "confidence": float(probs[i])}
            for i in top3_indices
        ]

        return {
            "body_shape_prediction": shape_pred,
            "confidence_score": conf_score,
            "top3_candidates": top3_candidates,
            "anthropometric_measurements": {
                "shoulder_width_px": float(meas_raw[0]),
                "chest_width_px": float(meas_raw[1]),
                "waist_width_px": float(meas_raw[2]),
                "hip_width_px": float(meas_raw[3]),
                "torso_length_px": float(meas_raw[4]),
                "leg_length_px": float(meas_raw[5]),
                "shoulder_hip_ratio": float(meas_raw[6]),
                "waist_hip_ratio": float(meas_raw[7]),
                "chest_waist_ratio": float(meas_raw[8]),
            }
        }

    def _extract_measurements(self, img_bgr):
        h, w, _ = img_bgr.shape
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        _, bin_mask = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

        if np.mean(bin_mask[:10, :10]) > 128:
            bin_mask = cv2.bitwise_not(bin_mask)

        contours, _ = cv2.findContours(bin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            c = max(contours, key=cv2.contourArea)
            bx, by, bw, bh = cv2.boundingRect(c)
        else:
            bx, by, bw, bh = int(w * 0.1), int(h * 0.05), int(w * 0.8), int(h * 0.9)

        shoulder_y = int(by + 0.15 * bh)
        chest_y = int(by + 0.28 * bh)
        waist_y = int(by + 0.42 * bh)
        hip_y = int(by + 0.60 * bh)

        def measure_w(target_y):
            if target_y < 0 or target_y >= h:
                return float(bw * 0.6)
            row = bin_mask[target_y, :]
            nz = np.where(row > 0)[0]
            return float(nz[-1] - nz[0]) if len(nz) > 0 else float(bw * 0.6)

        sh_w = measure_w(shoulder_y)
        ch_w = measure_w(chest_y)
        wa_w = measure_w(waist_y)
        hi_w = measure_w(hip_y)
        torso_l = float(hip_y - shoulder_y)
        leg_l = float(bh - (hip_y - by))

        sh_hi_r = float(sh_w / max(1.0, hi_w))
        wa_hi_r = float(wa_w / max(1.0, hi_w))
        ch_wa_r = float(ch_w / max(1.0, wa_w))

        return np.array([sh_w, ch_w, wa_w, hi_w, torso_l, leg_l, sh_hi_r, wa_hi_r, ch_wa_r], dtype=np.float32)
