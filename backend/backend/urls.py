from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from content.views import (
    UserViewSet, CoursesViewSet, ProgressViewSet,
    EventsViewSet, EventListView, RegisterView, LoginView
)
from django.conf import settings
from django.conf.urls.static import static

# DRF Router for ViewSets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'courses', CoursesViewSet, basename='course')
router.register(r'progress', ProgressViewSet, basename='progress')
router.register(r'events', EventsViewSet, basename='event')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/register/', RegisterView.as_view(), name='register'),  # Registration route
    path('api/auth/login/', LoginView.as_view(), name='login'),  # Login route
    path('api/auth/events/', EventListView.as_view(), name='event-list'),  # Event list route
    path('api/', include(router.urls)),  # Include router-based paths
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
