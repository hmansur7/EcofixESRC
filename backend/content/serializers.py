from rest_framework import serializers
from .models import CourseProgress, LessonProgress, Lessons, User, Courses, Events, LessonResources
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
            'course': {'required': False},  
        }

#Serializer for resources endpoint
class LessonResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonResources
        fields = ['title', 'file', 'uploaded_at', 'lesson']
        extra_kwargs = {
            'title': {'required': True},
            'file': {'required': True},
            'lesson': {'required': True},
        }
        read_only_fields = ['uploaded_at']

    def validate_file(self, value):
        max_size_mb = 10  
        if value.size > max_size_mb * 1024 * 1024:
            raise serializers.ValidationError(f'File size should not exceed {max_size_mb} MB.')

        allowed_mime_types = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                              'application/vnd.openxmlformats-officedocument.presentationml.presentation']
        
        if value.content_type not in allowed_mime_types:
            raise serializers.ValidationError('Unsupported file type.')

        return value
