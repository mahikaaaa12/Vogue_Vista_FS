from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ColorAnalysisRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='color_analyses')
    undertone = models.CharField(max_length=50)
    skin_tone = models.CharField(max_length=50)
    season = models.CharField(max_length=50)
    palette = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.undertone} - {self.season} ({self.created_at.strftime('%Y-%m-%d')})"
