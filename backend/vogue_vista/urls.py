from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    
    # Body Analysis Endpoints
    path('api/body/', include('body_analysis.urls')),
    path('api/body-analysis/', include('body_analysis.urls')),
    
    # Color Analysis Endpoints
    path('api/color/', include('color_analysis.urls')),
    path('api/color-analysis/', include('color_analysis.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
