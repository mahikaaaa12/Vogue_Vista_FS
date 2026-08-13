from django.urls import path
from .views import UserAnalysisHistoryView

urlpatterns = [
    path('history/', UserAnalysisHistoryView.as_view(), name='user-analysis-history'),
]
