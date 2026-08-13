import base64
import re
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from .services import process_color_analysis
from .models import ColorAnalysisRecord
from .serializers import ColorAnalysisSerializer

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def analyze_color_api(request):
    """
    POST /api/color/analyze/
    Processes uploaded facial/skin image and returns skin undertone, skin tone, and season fashion recommendations.
    """
    image_bytes = None

    if 'file' in request.FILES:
        image_bytes = request.FILES['file'].read()
    elif 'image' in request.FILES:
        image_bytes = request.FILES['image'].read()
    elif isinstance(request.data, dict):
        img_data = request.data.get('file') or request.data.get('image') or request.data.get('photo')
        if isinstance(img_data, str) and img_data.startswith('data:image'):
            base64_data = re.sub(r'^data:image/.+;base64,', '', img_data)
            try:
                image_bytes = base64.b64decode(base64_data)
            except Exception:
                pass
        elif isinstance(img_data, str) and (img_data.startswith('http') or img_data.startswith('/')):
            try:
                import os
                from django.conf import settings
                rel_path = img_data.lstrip('/')
                possible_paths = [
                    os.path.join(settings.BASE_DIR, 'frontend', 'public', rel_path),
                    os.path.join(settings.BASE_DIR, 'frontend', 'dist', rel_path),
                    os.path.join(settings.BASE_DIR, rel_path)
                ]
                for p in possible_paths:
                    if os.path.exists(p):
                        with open(p, 'rb') as f:
                            image_bytes = f.read()
                        break
            except Exception:
                pass
    elif isinstance(request.data, str) and request.data.startswith('data:image'):
        base64_data = re.sub(r'^data:image/.+;base64,', '', request.data)
        try:
            image_bytes = base64.b64decode(base64_data)
        except Exception:
            pass

    try:
        payload = process_color_analysis(image_bytes)

        try:
            record = ColorAnalysisRecord.objects.create(
                user=request.user if request.user.is_authenticated else None,
                undertone=payload.get('undertone', 'Cool'),
                skin_tone=payload.get('skin_tone', 'Fair'),
                season=payload.get('season', 'Winter'),
                palette=payload.get('palette', []),
                recommendations=payload.get('recommendations', [])
            )
            payload['id'] = record.id
        except Exception:
            pass

        return Response(payload, status=status.HTTP_200_OK)
    except ValueError as ve:
        return Response({"detail": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"detail": f"Error processing color analysis: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def color_history_api(request):
    """
    GET /api/color/history/
    Retrieves user's historical color analysis results.
    """
    try:
        records = ColorAnalysisRecord.objects.all().order_by('-created_at')[:10]
        serializer = ColorAnalysisSerializer(records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception:
        return Response([], status=status.HTTP_200_OK)
