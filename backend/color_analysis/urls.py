from django.urls import path
from .views import analyze_color_api, color_history_api

urlpatterns = [
    path('analyze/', analyze_color_api, name='color-analysis-analyze'),
    path('history/', color_history_api, name='color-analysis-history'),
]
