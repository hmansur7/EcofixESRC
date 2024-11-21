from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from content.views import (
    UserViewSet, ContentViewSet, UserProgressViewSet,
    EventViewSet, EventRegistrationViewSet
)
from content.views import RegisterView, LoginView 

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'contents', ContentViewSet)
router.register(r'user-progress', UserProgressViewSet)
router.register(r'events', EventViewSet)
router.register(r'event-registrations', EventRegistrationViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/register/', RegisterView.as_view(), name='register'),
    path('api/users/login/', LoginView.as_view(), name='login'),
    path('api/', include(router.urls)),
    path('', include('content.urls')), 
]
