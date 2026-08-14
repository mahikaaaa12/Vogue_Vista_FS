from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import AnalysisHistory
from .serializers import AnalysisHistorySerializer

class UserAnalysisHistoryView(APIView):
    """
    GET /api/auth/history/?type=BODY or GET /api/auth/history/?type=COLOR or GET /api/auth/history/
    Retrieves analysis history for the authenticated user with optional type filtering.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        analysis_type = request.query_params.get('type', None)
        
        if request.user.is_authenticated:
            queryset = AnalysisHistory.objects.filter(user=request.user)
        else:
            queryset = AnalysisHistory.objects.all()

        if analysis_type:
            queryset = queryset.filter(analysis_type__iexact=analysis_type)

        serializer = AnalysisHistorySerializer(queryset[:20], many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = AnalysisHistorySerializer(data=request.data)
        if serializer.is_valid():
            if request.user.is_authenticated:
                serializer.save(user=request.user)
            else:
                serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
