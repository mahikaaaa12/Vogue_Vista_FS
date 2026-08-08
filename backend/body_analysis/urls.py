from django.urls import path
from .views import BodyShapeInferenceView, BodyShapeHistoryView

urlpatterns = [
    path('predict/', BodyShapeInferenceView.as_view(), name='body-shape-predict'),
    path('history/', BodyShapeHistoryView.as_view(), name='body-shape-history'),
]
