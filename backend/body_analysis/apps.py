import os
from django.apps import AppConfig

class BodyAnalysisConfig(AppConfig):
    name = 'body_analysis'
    verbose_name = 'Body Analysis Engine'

    @property
    def default_auto_field(self):
        if os.environ.get("MONGODB_URI"):
            return "django_mongodb_backend.fields.ObjectIdAutoField"
        return "django.db.models.BigAutoField"
