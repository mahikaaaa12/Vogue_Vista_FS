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
    uploaded_file = request.FILES.get('file', request.FILES.get('image', None))
    
    try:
        image_bytes = uploaded_file.read() if uploaded_file else None
        payload = process_color_analysis(image_bytes)

        try:
            record = ColorAnalysisRecord.objects.create(
                user=request.user if request.user.is_authenticated else None,
                undertone=payload.get('undertone', 'Warm'),
                skin_tone=payload.get('skin_tone', 'Medium'),
                season=payload.get('season', 'Autumn'),
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
