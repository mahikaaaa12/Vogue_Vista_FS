"""
ml_service.image_models.body_shape.male_multimodal

Male Dual-Branch Multimodal Neural Network & Predictor Engine.
"""

import numpy as np
import cv2
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models as tv_models
from PIL import Image
from ml_service.shared.config import MLConfig
from ml_service.shared.constants import MALE_CLASSES, MALE_FEATURE_COLS
from ml_service.shared.model_loader import ModelLoader
from ml_service.image_models.preprocessing.image_transforms import get_eval_transforms


class MaleMeasurementMLP(nn.Module):
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


class DualBranchMaleMultimodalNet(nn.Module):
    def __init__(self, num_classes=5, freeze_backbone=False):
        super().__init__()
        weights = tv_models.EfficientNet_V2_S_Weights.DEFAULT
        backbone = tv_models.efficientnet_v2_s(weights=weights)
        self.rgb_branch = backbone.features
        self.rgb_pool = nn.AdaptiveAvgPool2d(1)

        if freeze_backbone:
            for param in self.rgb_branch.parameters():
                param.requires_grad = False

        self.meas_branch = MaleMeasurementMLP(input_dim=len(MALE_FEATURE_COLS), hidden_dim=64, embed_dim=128)

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


class MaleBodyShapePredictor:
    """Production Predictor Engine for Male Body Shape Analysis."""
    def __init__(self, model_path=None, use_gpu=True):
        self.loader = ModelLoader()
        self.device = torch.device(self.loader.device if use_gpu else "cpu")
        self.classes = MALE_CLASSES

        self.model = DualBranchMaleMultimodalNet(num_classes=len(self.classes), freeze_backbone=False).to(self.device)

        if model_path is None:
            model_path = MLConfig.MALE_MODEL_PTH

        try:
            state_dict = self.loader.load_model(model_path, model_type="pytorch")
            if isinstance(state_dict, dict) and "state_dict" in state_dict:
                state_dict = state_dict["state_dict"]
            self.model.load_state_dict(state_dict, strict=False)
        except Exception:
            pass

        self.model.eval()
        self.transform = get_eval_transforms()

        self.scaler_mean = np.array([245.0, 235.0, 220.0, 215.0, 230.0, 280.0, 1.14, 1.02, 1.07], dtype=np.float32)
        self.scaler_std = np.array([35.0, 30.0, 28.0, 25.0, 32.0, 38.0, 0.18, 0.14, 0.17], dtype=np.float32)

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

        # Male fashion recommendations map
        recs = self._get_male_recommendations(shape_pred)

        return {
            "gender": "male",
            "body_shape": shape_pred,
            "confidence": round(conf_score, 4),
            "measurements": {
                "shoulders": float(meas_raw[0]),
                "chest": float(meas_raw[1]),
                "waist": float(meas_raw[2]),
                "hips": float(meas_raw[3])
            },
            "recommendations": recs
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

        shoulder_y = int(by + 0.16 * bh)
        chest_y = int(by + 0.28 * bh)
        waist_y = int(by + 0.44 * bh)
        hip_y = int(by + 0.62 * bh)

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

    def _get_male_recommendations(self, shape):
        rules = {
            "trapezoid": {
                "recommended": ["Slim-fit button-down shirts", "Tailored blazers with natural shoulder pads", "Straight-leg denim"],
                "avoid": ["Oversized boxy hoodies", "Skinny jeans distorting leg balance"],
                "stylist_tip": "The trapezoid is naturally well-proportioned. Emphasize your clean lines with tailored slim fits."
            },
            "rectangle": {
                "recommended": ["Layered jackets with structured shoulders", "Horizontal chest stripe t-shirts", "Pleated trousers"],
                "avoid": ["Unstructured vertical stripe shirts", "Monochromatic skin-tight outfits"],
                "stylist_tip": "Create visual dimension across shoulders and chest using layered jackets and textured fabrics."
            },
            "triangle": {
                "recommended": ["Vertical stripe shirts", "Epaulette detailed jackets", "Structured crew-neck t-shirts"],
                "avoid": ["Tops ending right at hip line", "Tight polo collars"],
                "stylist_tip": "Broaden shoulder silhouette with epaulettes and structured shoulder pads while streamlining lower body."
            },
            "oval": {
                "recommended": ["Dark vertical pinstripe blazers", "V-neck sweater layers", "Straight-cut unpleated trousers"],
                "avoid": ["Horizontal chest stripes", "Tight fitted polo shirts"],
                "stylist_tip": "Elongate the torso using clean vertical lines, V-necklines, and open-front jackets."
            },
            "inverted_triangle": {
                "recommended": ["V-neck fitted t-shirts", "Unstructured soft blazers", "Straight-leg slim jeans"],
                "avoid": ["Padded peak-lapel blazers", "Heavy bulky scarves"],
                "stylist_tip": "Showcase your broad shoulders with clean V-necks while balancing hips with straight-leg trousers."
            }
        }
        return rules.get(shape, rules["trapezoid"])
