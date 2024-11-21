from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from content.views import (
    UserViewSet, ContentViewSet, UserProgressViewSet,
    EventViewSet, EventRegistrationViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'contents', ContentViewSet)
router.register(r'user-progress', UserProgressViewSet)
router.register(r'events', EventViewSet)
router.register(r'event-registrations', EventRegistrationViewSet)

urlpatterns = [
     path('admin/', admin.site.urls),
     path('api/', include(router.urls)),
    path('', include('content.urls')), 
]
