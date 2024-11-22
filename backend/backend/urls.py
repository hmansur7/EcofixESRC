from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from content.views import (
    UserViewSet, CoursesViewSet, ProgressViewSet,
    EventsViewSet
)
from content.views import RegisterView, LoginView
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'courses', CoursesViewSet)
router.register(r'progress', ProgressViewSet)
router.register(r'events', EventsViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/register/', RegisterView.as_view(), name='register'),
    path('api/users/login/', LoginView.as_view(), name='login'),
    path('api/', include(router.urls)),
    path('', include('content.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)