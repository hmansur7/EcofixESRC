from rest_framework import serializers
from .models import (
    CourseProgress,
    LessonProgress,
    Lesson,  # Changed from Lessons
    Course,  # Changed from Courses
    Event,   # Changed from Events
    LessonResource,  # Changed from LessonResources
    AppUser  # Your custom user model
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppUser  # Changed from User
        fields = ['name', 'email', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation.pop('password', None)
        return representation

    def create(self, validated_data):
        # Updated to match your AppUser model's fields
        return AppUser.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
        )

class CourseSerializer(serializers.ModelSerializer):  # Changed from CoursesSerializer
    class Meta:
        model = Course  # Changed from Courses
        fields = ['course_id', 'title', 'description']

class EventSerializer(serializers.ModelSerializer):  # Changed from EventsSerializer
    class Meta:
        model = Event  # Changed from Events
        fields = ['event_id', 'title', 'description', 'start_time', 'end_time', 'attendees']

class UserRegisteredEventsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event  # Changed from Events
        fields = ['event_id', 'title', 'description', 'start_time', 'end_time']

class CourseProgressSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = CourseProgress
        fields = ['course', 'user', 'progress_percentage']  # Changed from 'progress' to match model

class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ['id', 'user', 'lesson', 'completed']

class LessonSerializer(serializers.ModelSerializer):  # Changed from LessonsSerializer
    class Meta:
        model = Lesson  # Changed from Lessons
        fields = ['lesson_id', 'course', 'title', 'description', 'order']  # Removed 'content' as it's not in your model
        extra_kwargs = {
            'title': {'required': True},
            'description': {'required': True},
            'order': {'required': True},
        }

class LessonResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonResource  # Changed from LessonResources
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

        allowed_extensions = ['pdf', 'docx', 'pptx', 'xlsx', 'jpg', 'jpeg', 'png', 'zip']  # Updated to match model
        file_extension = value.name.split('.')[-1].lower()
        
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError(f'Unsupported file type. Allowed types: {", ".join(allowed_extensions)}')

        return value