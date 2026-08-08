from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class BodyAnalysisRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='body_analyses')
    gender = models.CharField(max_length=20, default='female')
    bust_inches = models.FloatField(null=True, blank=True)
    waist_inches = models.FloatField(null=True, blank=True)
    hip_inches = models.FloatField(null=True, blank=True)
    high_hip_inches = models.FloatField(null=True, blank=True)
    predicted_shape = models.CharField(max_length=50)
    confidence = models.FloatField(default=0.95)
    recommendations = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.predicted_shape} ({self.created_at.strftime('%Y-%m-%d')})"
