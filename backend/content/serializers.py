from rest_framework import serializers
from .models import CourseProgress, LessonProgress, Lessons, User, Courses, Events
from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'name', 'email', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}  # Password is write-only

    def to_representation(self, instance):
        """
        Exclude the password field in read operations (responses).
        """
        representation = super().to_representation(instance)
        representation.pop('password', None)  # Remove password from response
        return representation

    def create(self, validated_data):
        """
        Create a user with a hashed password.
        """
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
        )
        return user


class CoursesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Courses
        fields = '__all__'

class EventsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Events
        fields = ['event_id', 'title', 'description', 'start_time', 'end_time']
        

class UserRegisteredEventsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Events
        fields = ['event_id', 'title', 'description', 'start_time', 'end_time']

class CourseProgressSerializer(serializers.ModelSerializer):
    course = CoursesSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = CourseProgress
        fields = ['id', 'user', 'course', 'progress_percentage']


class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ['id', 'user', 'lesson', 'completed']

class LessonsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lessons
        fields = ['lesson_id', 'course', 'title', 'description', 'content', 'order']
        extra_kwargs = {
            'title': {'required': True},
            'description': {'required': True},
            'content': {'required': True},
            'order': {'required': True},
            'course': {'required': False},  # Set by `perform_create`
        }