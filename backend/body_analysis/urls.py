from django.urls import path
from .views import AnalyzeBodyView, HistoryView, AnalysisDetailView
from .photo_views import AnalysisPhotoView, AnalyzeMeasurementsView

urlpatterns = [
    # Public endpoint consumed by frontend clients (supports predict/, photo/, etc.)
    path("predict/",           AnalysisPhotoView.as_view(),  name="predict"),
    path("predict",            AnalysisPhotoView.as_view(),  name="predict-no-slash"),
    path("analysis/photo/",    AnalysisPhotoView.as_view(),  name="analysis-photo"),
    path("analysis/measurements/", AnalyzeMeasurementsView.as_view(), name="analysis-measurements"),

    # Authenticated REST surface
    path("analyze-body/",      AnalyzeBodyView.as_view(),    name="analyze-body"),
    path("history/",           HistoryView.as_view(),        name="history"),
    path("history/<int:pk>/",  AnalysisDetailView.as_view(), name="history-detail"),
]
