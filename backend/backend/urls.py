# backend/backend/urls.py
from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from content.views import (
    UserViewSet, 
    CourseViewSet,  
    EventViewSet,   
    UserEventsView,
    EventRegistrationView,
    RegisterView, 
    LoginView, 
    AdminUserListView,
    AdminAddCourseView, 
    AdminRemoveCourseView, 
    AdminAddEventView, 
    AdminRemoveEventView,
    AdminListCoursesView, 
    AdminListEventsView, 
    UserRegisteredEventsListView,
    UnregisterFromEventView, 
    AdminEventRegistrationsView, 
    UpdateLessonProgressView, 
    GetCourseProgressView,
    CourseLessonsView, 
    AdminAddLessonView, 
    AdminRemoveLessonView, 
    LessonResourcesView, 
    AddLessonResourceView,
    DeleteLessonResourceView,
    VerifyEmailView,
    ResendVerificationView,
    ChangePasswordView,
    LogoutView
)
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'events', EventViewSet, basename='event')

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    
    # Authentication endpoints
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('api/auth/resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    path('api/auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    # Event endpoints
    path('api/events/<int:event_id>/register/', EventRegistrationView.as_view(), name='register-for-event'),
    path('api/events/registered/', UserRegisteredEventsListView.as_view(), name='registered-events-list'),
    path('api/events/<int:event_id>/unregister/', UnregisterFromEventView.as_view(), name='unregister-event'),
    path('api/events/user/list/', UserEventsView.as_view(), name='user-event-list'),
    # Course and Lesson endpoints
    path('api/lessons/<int:lesson_id>/progress/', UpdateLessonProgressView.as_view(), name='update-lesson-progress'),
    path('api/courses/<int:course_id>/progress/', GetCourseProgressView.as_view(), name='get-course-progress'),
    path('api/courses/<int:course_id>/lessons/', CourseLessonsView.as_view(), name='course-lessons'),
    path('api/lessons/<int:lesson_id>/resources/', LessonResourcesView.as_view(), name='lesson-resources'),
    
    # Admin endpoints
    path('api/admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('api/admin/courses/', AdminListCoursesView.as_view(), name='admin-list-courses'),
    path('api/admin/courses/add/', AdminAddCourseView.as_view(), name='admin-add-course'),
    path('api/admin/courses/<int:id>/', AdminRemoveCourseView.as_view(), name='admin-remove-course'),
    path('api/admin/events/', AdminListEventsView.as_view(), name='admin-list-events'),
    path('api/admin/events/add/', AdminAddEventView.as_view(), name='admin-add-event'),
    path('api/admin/events/<int:event_id>/remove/', AdminRemoveEventView.as_view(), name='admin-remove-event'),
    path('api/admin/events/<int:event_id>/registrations/', AdminEventRegistrationsView.as_view(), name='admin-event-registrations'),
    path('api/admin/lessons/add/', AdminAddLessonView.as_view(), name='admin-add-lesson'),
    path('api/admin/lessons/<int:lesson_id>/remove', AdminRemoveLessonView.as_view(), name='admin-remove-lesson'),
    path('api/admin/lessons/resources/add/', AddLessonResourceView.as_view(), name='add-lesson-resource'),
    path('api/admin/lessons/resources/<int:id>/', DeleteLessonResourceView.as_view(), name='delete-lesson-resource'),
    
    # Include router URLs
    path('api/', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)