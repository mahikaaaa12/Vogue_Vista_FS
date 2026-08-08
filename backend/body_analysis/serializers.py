from rest_framework import serializers
from .models import BodyAnalysisRecord

class BodyAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyAnalysisRecord
        fields = '__all__'
