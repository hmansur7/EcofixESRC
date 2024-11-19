from rest_framework import viewsets
from .models import User, Content, UserProgress, Event, EventRegistration
from .serializers import (
    UserSerializer, ContentSerializer, UserProgressSerializer,
    EventSerializer, EventRegistrationSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class ContentViewSet(viewsets.ModelViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer

class UserProgressViewSet(viewsets.ModelViewSet):
    queryset = UserProgress.objects.all()
    serializer_class = UserProgressSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

class EventRegistrationViewSet(viewsets.ModelViewSet):
    queryset = EventRegistration.objects.all()
    serializer_class = EventRegistrationSerializer
