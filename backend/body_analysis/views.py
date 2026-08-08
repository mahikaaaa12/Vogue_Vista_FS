from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from .services import BodyAnalysisService
from .models import BodyAnalysisRecord
from .serializers import BodyAnalysisSerializer

class BodyShapeInferenceView(APIView):
    """
    Unified API View handling body shape prediction and photo uploads.
    """
    def post(self, request, *args, **kwargs):
        try:
            gender = request.data.get('gender', 'female')
            uploaded_file = request.FILES.get('image', None)
            filename = None
            image_url = None

            if uploaded_file:
                filename = default_storage.save(f"uploads/{uploaded_file.name}", uploaded_file)
                image_url = request.build_absolute_uri(f"/media/{filename}")

            bust = float(request.data.get('bust', request.data.get('chest', 36)))
            waist = float(request.data.get('waist', 28))
            hip = float(request.data.get('hip', 38))

            shape, confidence, recs = BodyAnalysisService.calculate_shape(bust, waist, hip, gender)

            record = BodyAnalysisRecord.objects.create(
                user=request.user if request.user.is_authenticated else None,
                gender=gender,
                bust_inches=bust,
                waist_inches=waist,
                hip_inches=hip,
                predicted_shape=shape,
                confidence=confidence,
                recommendations=recs
            )

            return Response({
                "status": "success",
                "id": record.id,
                "body_shape": shape,
                "shape": shape,
                "confidence": confidence,
                "recommendations": recs,
                "image_url": image_url,
                "metrics": {
                    "bust": bust,
                    "waist": waist,
                    "hip": hip,
                    "gender": gender
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        return Response({
            "status": "active",
            "endpoint": "body_analysis",
            "supported_genders": ["female", "male"]
        }, status=status.HTTP_200_OK)

class BodyShapeHistoryView(APIView):
    """
    API View for retrieving previous body shape analysis records.
    """
    def get(self, request, *args, **kwargs):
        records = BodyAnalysisRecord.objects.all().order_by('-created_at')[:10]
        serializer = BodyAnalysisSerializer(records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
