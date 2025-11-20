from django.contrib import admin
from django.urls import path, include
from django.http import FileResponse, Http404
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def serve_frontend(request, path='index.html'):
    file_path = BASE_DIR / 'frontend' / path
    if not file_path.exists():
        raise Http404('Frontend file not found')
    return FileResponse(open(file_path, 'rb'), content_type='text/html')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('tasks.urls')),
    path('frontend/', serve_frontend),
    path('frontend/<path:path>', serve_frontend),
]
