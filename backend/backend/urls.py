from django.urls import path, include
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
    path('api/', include(router.urls)),
]
