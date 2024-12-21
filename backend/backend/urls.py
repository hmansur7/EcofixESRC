from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from content.views import (
    UserViewSet, CoursesViewSet, EventsViewSet,
    RegisterView, LoginView, AdminUserListView,
    AdminAddCourseView, AdminRemoveCourseView, AdminAddEventView, AdminRemoveEventView, 
    AdminListCoursesView, AdminListEventsView, RegisterView, UserRegisteredEventsListView,
    UnregisterFromEventView, AdminEventRegistrationsView, UpdateLessonProgressView, GetCourseProgressView,
    CourseLessonsView, AdminAddLessonView, AdminRemoveLessonView, ListLessonResourcesView, AddLessonResourceView, 
    DeleteLessonResourceView,
    )
from django.conf import settings
from django.conf.urls.static import static

# DRF Router for public ViewSets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')  
router.register(r'courses', CoursesViewSet, basename='course')  

router.register(r'events', EventsViewSet, basename='event') 

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    # Authentication endpoints
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    # User-specific endpoints
    path('api/event/<int:event_id>/register/', RegisterView.as_view(), name='register_for_event'),
    path('api/event/list/', UserRegisteredEventsListView.as_view(), name='registered-events-list'),
    path('api/event/<int:event_id>/unregister/', UnregisterFromEventView.as_view(), name='unregister_event'),
    path('api/lesson/<int:lesson_id>/progress/', UpdateLessonProgressView.as_view(), name='update_lesson_progress'),
    path('api/course/<int:course_id>/progress/', GetCourseProgressView.as_view(), name='get_course_progress'),
    path('api/courses/<int:course_id>/lessons/', CourseLessonsView.as_view(), name='lessons-for-course'),
    path('api/courses/<int:course_id>/lessons/', CourseLessonsView.as_view(), name='course-lessons'),
    path('api/lessons/lesson-resources/list', ListLessonResourcesView.as_view(), name='list-lesson-resources'),
    # Admin-specific endpoints
    path('api/admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('api/admin/courses/add/', AdminAddCourseView.as_view(), name='admin-add-course'),
    path('api/admin/courses/remove/<int:course_id>/', AdminRemoveCourseView.as_view(), name='admin-remove-course'),
    path('api/admin/events/add/', AdminAddEventView.as_view(), name='admin-add-event'),
    path('api/admin/events/remove/<int:event_id>/', AdminRemoveEventView.as_view(), name='admin-remove-event'),
    path('api/admin/events/<int:event_id>/registrations/', AdminEventRegistrationsView.as_view(), name='admin-event-registrations'),
    path('api/admin/lessons/add/', AdminAddLessonView.as_view(), name='admin-add-lesson'),
    path('api/admin/lessons/remove/<int:lesson_id>/', AdminRemoveLessonView.as_view(), name='admin-remove-lesson'),
    path('api/admin/lesson-resources/add/', AddLessonResourceView.as_view(), name='add-lesson-resource'),
    path('api/admin/lesson-resources/<int:pk>/delete/', DeleteLessonResourceView.as_view(), name='delete-lesson-resource'),
    # Default DRF router paths
    path('api/', include(router.urls)),
    path('api/admin/courses/', AdminListCoursesView.as_view(), name='admin-list-courses'),
    path('api/admin/events/', AdminListEventsView.as_view(), name='admin-list-events'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
