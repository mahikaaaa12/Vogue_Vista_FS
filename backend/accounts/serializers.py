from rest_framework import serializers
from .models import User, AnalysisHistory

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class AnalysisHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisHistory
        fields = ['id', 'user', 'analysis_type', 'prediction', 'preview_image', 'created_at', 'details']
        read_only_fields = ['id', 'user', 'created_at']
