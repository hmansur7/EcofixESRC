from django.urls import path
from content import views

urlpatterns = [
    # Admin endpoints
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-users'),
    path('admin/courses/', views.AdminListCoursesView.as_view(), name='admin-list-courses'),
    path('admin/courses/add/', views.AdminAddCourseView.as_view(), name='admin-add-course'),
    path('admin/courses/remove/<int:course_id>/', views.AdminRemoveCourseView.as_view(), name='admin-remove-course'),
    path('admin/events/', views.AdminListEventsView.as_view(), name='admin-list-events'),
    path('admin/events/add/', views.AdminAddEventView.as_view(), name='admin-add-event'),
    path('admin/events/<int:event_id>/remove/', views.AdminRemoveEventView.as_view(), name='admin-remove-event'),
    path('admin/lessons/add/', views.AdminAddLessonView.as_view(), name='admin-add-lesson'),
    path('admin/lessons/<int:lesson_id>/remove', views.AdminRemoveLessonView.as_view(), name='admin-remove-lesson'),
    path('admin/lessons/resources/add/', views.AddLessonResourceView.as_view(), name='add-lesson-resource'),
    path('admin/lessons/resources/<int:id>/', views.DeleteLessonResourceView.as_view(), name='delete-lesson-resource'),
    path('admin/courses/<int:course_id>/visibility/', views.AdminUpdateCourseVisibilityView.as_view(), name='admin-update-course-visibility'),
    path('admin/courses/<str:course_id>/update/', views.AdminUpdateCourseView.as_view(), name='admin-update-course'),
    
    # Authentication endpoints
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/verify-email/', views.VerifyEmailView.as_view(), name='verify-email'),
    path('auth/resend-verification/', views.ResendVerificationView.as_view(), name='resend-verification'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),

    # Course and Lesson endpoints
    path('lessons/<int:lesson_id>/progress/', views.UpdateLessonProgressView.as_view(), name='update-lesson-progress'),
    path('courses/<int:course_id>/progress/', views.GetCourseProgressView.as_view(), name='get-course-progress'),
    path('courses/<int:course_id>/lessons/', views.CourseLessonsView.as_view(), name='course-lessons'),
    path('lessons/<int:lesson_id>/resources/', views.LessonResourcesView.as_view(), name='lesson-resources'),
    path('resources/<int:resource_id>/preview/', views.ResourcePreviewView.as_view(), name='resource-preview'),
    path('resources/<int:resource_id>/download/', views.ResourceDownloadView.as_view(), name='resource-download'),
    path('courses/available/', views.AvailableCoursesView.as_view(), name='available-courses'),
    path('courses/enrolled/', views.EnrolledCoursesView.as_view(), name='enrolled-courses'),
    path('courses/enroll/<int:course_id>/', views.EnrollCourseView.as_view(), name='enroll-course'),
]
