# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse, JsonResponse

def home_view(request):
    return HttpResponse("Welcome to Django Mongo Project API!")

def health_check(request):
    """Lightweight health check — NO database queries, safe for UptimeRobot."""
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home_view, name='home'),
    path('api/health', health_check, name='health_check'),
    path('api/', include('api.urls')),
]
