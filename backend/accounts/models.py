from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    pass

class AnalysisHistory(models.Model):
    ANALYSIS_TYPES = (
        ('BODY', 'Body Analysis'),
        ('COLOR', 'Color Analysis'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analysis_history', null=True, blank=True)
    analysis_type = models.CharField(max_length=20, choices=ANALYSIS_TYPES)
    prediction = models.CharField(max_length=100)
    preview_image = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username if self.user else 'Guest'} - {self.analysis_type} ({self.prediction})"
