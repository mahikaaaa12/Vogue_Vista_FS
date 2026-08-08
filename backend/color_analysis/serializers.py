from rest_framework import serializers
from .models import ColorAnalysisRecord

class ColorAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ColorAnalysisRecord
        fields = '__all__'
