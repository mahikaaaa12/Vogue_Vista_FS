"""
Public photo-analysis endpoint matching the VOGUE VISTA frontend contract.
Supports both Base64 JSON payloads and Multipart FormData file uploads.
"""
from __future__ import annotations
import base64
import binascii
import logging
import tempfile
from pathlib import Path

from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .ml.pipeline import run as run_pipeline, PipelineError
from body_analysis.recommendations.recommendation_engine import generate_recommendations
from body_analysis.intelligence.body_traits import extract_traits
from body_analysis.intelligence.proportion_engine import compute_scores

logger = logging.getLogger(__name__)

_ALLOWED_MIME = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
_EXT = {"image/jpeg": ".jpg", "image/jpg": ".jpg", "image/png": ".png", "image/webp": ".webp"}

_PRESENTATION = {
    "hourglass":   {"emoji": "⧖", "description": "Balanced shoulder and hip line with a defined waist — the classic symmetrical silhouette."},
    "pear":        {"emoji": "◐", "description": "Hips read wider than the shoulder line, with a softly defined waist."},
    "apple":       {"emoji": "◉", "description": "Fullness through the midsection with a softer waist definition and slimmer lower body."},
    "rectangle":   {"emoji": "▭", "description": "Shoulders, waist and hips run on a similar vertical line — a long, athletic frame."},
    "inverted_triangle": {"emoji": "▽", "description": "Strong shoulder line tapering down through a narrower hip."},
    "triangle":    {"emoji": "△", "description": "Lower body anchors the silhouette, with a lighter upper frame."},
    "trapezoid":   {"emoji": "⬡", "description": "Broad shoulders and chest with a balanced taper to the waist and hips."},
    "oval":        {"emoji": "⬏", "description": "Fuller torso volume with a soft midsection profile."}
}

_DEFAULT_PRESENTATION = {"emoji": "◈", "description": "A distinctive silhouette read directly from your proportions."}

def _proportion_bars(measurements: dict, features: dict) -> dict:
    def pct(v, lo, hi):
        if v is None:
            return 50
        try:
            f = float(v)
        except (TypeError, ValueError):
            return 50
        return max(8, min(95, int(round((f - lo) / (hi - lo) * 100))))

    shoulder_w = (measurements or {}).get("shoulder_width") or (features or {}).get("shoulder_width")
    bust_w     = (measurements or {}).get("bust_width")     or (features or {}).get("bust_width")
    waist_w    = (measurements or {}).get("waist_width")    or (features or {}).get("waist_width")
    hip_w      = (measurements or {}).get("hip_width")      or (features or {}).get("hip_width")

    def label_for(v, lo, hi):
        if v is None: return "—"
        p = pct(v, lo, hi)
        if p < 35:  return "Narrow"
        if p < 65:  return "Balanced"
        return "Defined"

    return {
        "shoulders": {"label": label_for(shoulder_w, 0.10, 0.35), "pct": pct(shoulder_w, 0.10, 0.35)},
        "bust":      {"label": label_for(bust_w,     0.10, 0.35), "pct": pct(bust_w,     0.10, 0.35)},
        "waist":     {"label": label_for(waist_w,    0.08, 0.30), "pct": pct(waist_w,    0.08, 0.30)},
        "hips":      {"label": label_for(hip_w,      0.10, 0.36), "pct": pct(hip_w,      0.10, 0.36)},
    }

class AnalysisPhotoView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        return Response({"message": "Photo Analysis API Running"})

    def post(self, request):
        payload = request.data or {}
        gender = (payload.get("gender") or "female").lower()

        image_file = request.FILES.get("image") or request.FILES.get("file")
        tmp_path = None

        try:
            if image_file:
                with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                    for chunk in image_file.chunks():
                        tmp.write(chunk)
                    tmp_path = Path(tmp.name)
            else:
                mime = (payload.get("mimeType") or "image/jpeg").lower()
                b64 = payload.get("base64Data") or ""
                if not b64:
                    return Response({"detail": "No image file or base64Data provided."}, status=status.HTTP_400_BAD_REQUEST)
                raw = base64.b64decode(b64, validate=True)
                ext = _EXT.get(mime, ".jpg")
                with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
                    tmp.write(raw)
                    tmp_path = Path(tmp.name)

            result = run_pipeline(str(tmp_path), gender=gender)
        except PipelineError as e:
            return Response({"detail": str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except Exception as e:
            logger.exception("Photo analysis failed")
            return Response({"detail": f"Unexpected error: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            if tmp_path and tmp_path.exists():
                try: tmp_path.unlink(missing_ok=True)
                except Exception: pass

        label = (result.get("predicted_shape") or "").lower()
        features = result.get("features", {})

        traits = extract_traits(features)
        scores = compute_scores(features)
        recommendations = generate_recommendations(gender, label, features)
        pres = _PRESENTATION.get(label, _DEFAULT_PRESENTATION)

        confidence_val = float(result.get("confidence") or 0.95)
        confidence_pct = int(round(confidence_val * 100))
        shape_title = label.replace("_", " ").title() or "Undetermined"

        return Response({
            "status": "success",
            "gender": gender,
            "shape": shape_title,
            "body_shape": shape_title,
            "confidence": confidence_val,
            "confidence_pct": confidence_pct,
            "emoji": pres["emoji"],
            "description": pres["description"],
            "proportions": _proportion_bars(result.get("measurements"), result.get("features")),
            "traits": traits,
            "scores": scores,
            "recommendations": recommendations,
            "probabilities": result.get("probabilities", {}),
            "model_loaded": f"{gender}_classifier.joblib",
            "processing_ms": result.get("processing_ms"),
        }, status=status.HTTP_200_OK)

from rest_framework import serializers
from body_analysis.ml.features import calculate_ratios
from body_analysis.ml.classifier import predict as predict_shape

class MeasurementAnalysisSerializer(serializers.Serializer):
    gender = serializers.ChoiceField(choices=["female", "male"])
    shoulder = serializers.FloatField(min_value=0.1)
    waist = serializers.FloatField(min_value=0.1)
    hip = serializers.FloatField(min_value=0.1)
    torso = serializers.FloatField(min_value=0.1)
    unit = serializers.ChoiceField(choices=["cm", "inch", "inches"], default="cm")

class AnalyzeMeasurementsView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({"message": "Measurement Analysis API Running"})

    def post(self, request):
        serializer = MeasurementAnalysisSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated = serializer.validated_data
        gender = validated["gender"]
        shoulder = validated["shoulder"]
        waist = validated["waist"]
        hip = validated["hip"]
        torso = validated["torso"]

        feature_dict = calculate_ratios(
            shoulder=shoulder, waist=waist, hip=hip, torso=torso,
            symmetry=1.0, midline_offset=0.0
        )

        avg_sh_hip = (shoulder + hip) / 2.0
        waist_def = max(0.0, (avg_sh_hip - waist) / avg_sh_hip) if avg_sh_hip > 1e-6 else 0.0

        feature_dict.update({
            "shoulder_width": shoulder,
            "waist_width": waist,
            "hip_width": hip,
            "torso_height": torso,
            "body_balance": feature_dict["shoulder_to_hip"],
            "waist_definition": waist_def,
            "avg_visibility": 1.0,
        })

        prediction = predict_shape(feature_dict, gender, use_rules=False)
        label = prediction["label"].lower()
        confidence = prediction["confidence"]
        shape_title = label.replace("_", " ").title() or "Undetermined"

        traits = extract_traits(feature_dict)
        scores = compute_scores(feature_dict)
        recommendations = generate_recommendations(gender, label, feature_dict)
        pres = _PRESENTATION.get(label, _DEFAULT_PRESENTATION)

        return Response({
            "status": "success",
            "predicted_shape": label,
            "shape": shape_title,
            "body_shape": shape_title,
            "confidence": confidence,
            "prediction_method": "measurements",
            "model_name": f"{gender}_classifier.joblib",
            "gender": gender,
            "emoji": pres["emoji"],
            "description": pres["description"],
            "proportions": _proportion_bars({"shoulder_width": shoulder, "waist_width": waist, "hip_width": hip, "torso_height": torso}, feature_dict),
            "traits": traits,
            "scores": scores,
            "recommendations": recommendations,
        }, status=status.HTTP_200_OK)
