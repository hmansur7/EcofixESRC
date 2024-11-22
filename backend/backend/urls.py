from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from content.views import (
    UserViewSet, CoursesViewSet, ProgressViewSet, EventsViewSet,
    RegisterView, LoginView, AdminUserListView,
    AdminAddCourseView, AdminRemoveCourseView, AdminAddEventView, AdminRemoveEventView, 
    AdminListCoursesView, AdminListEventsView, LessonsViewSet, LessonsListView, GetCourseProgressView, UpdateLessonProgressView
)
from django.conf import settings
from django.conf.urls.static import static

# DRF Router for public ViewSets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')  # User management
router.register(r'courses', CoursesViewSet, basename='course')  # Public course endpoints
router.register(r'events', EventsViewSet, basename='event')  # Public event endpoints
router.register(r'lessons', LessonsViewSet, basename='lesson')

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),

    # Authentication endpoints
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/courses/<int:course_id>/lessons/', LessonsListView.as_view(), name='course-lessons-list'),
    path('api/courses/<int:course_id>/progress/', GetCourseProgressView.as_view(), name='get-course-progress'),
    path('api/lessons/<int:lesson_id>/progress/', UpdateLessonProgressView.as_view(), name='update-lesson-progress'),

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
