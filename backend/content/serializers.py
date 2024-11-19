from rest_framework import serializers
from .models import User, Content, UserProgress, Event, EventRegistration

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Content
        fields = '__all__'

class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class EventRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistration
        fields = '__all__'
