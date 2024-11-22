from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from content.views import (
    UserViewSet, CoursesViewSet, ProgressViewSet, EventsViewSet,
    RegisterView, LoginView, AdminUserListView,
    AdminAddCourseView, AdminRemoveCourseView, AdminAddEventView, AdminRemoveEventView, 
    AdminListCoursesView, AdminListEventsView, RegisterForEventView
)
from django.conf import settings
from django.conf.urls.static import static

# DRF Router for public ViewSets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')  # User management
router.register(r'courses', CoursesViewSet, basename='course')  # Public course endpoints
router.register(r'progress', ProgressViewSet, basename='progress')  # User progress
router.register(r'events', EventsViewSet, basename='event')  # Public event endpoints

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),

    # Authentication endpoints
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/event/<int:event_id>/register/', RegisterForEventView.as_view(), name='register_for_event'),

    # Admin-specific endpoints
    path('api/admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('api/admin/courses/add/', AdminAddCourseView.as_view(), name='admin-add-course'),
    path('api/admin/courses/remove/<int:course_id>/', AdminRemoveCourseView.as_view(), name='admin-remove-course'),
    path('api/admin/events/add/', AdminAddEventView.as_view(), name='admin-add-event'),
    path('api/admin/events/remove/<int:event_id>/', AdminRemoveEventView.as_view(), name='admin-remove-event'),

    # Default DRF router paths
    path('api/', include(router.urls)),
    path('api/admin/courses/', AdminListCoursesView.as_view(), name='admin-list-courses'),
    path('api/admin/events/', AdminListEventsView.as_view(), name='admin-list-events'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
