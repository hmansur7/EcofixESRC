# serializers.py
from rest_framework import serializers
from .models import (
    CourseProgress,
    LessonProgress,
    Lesson,  
    Course,
    Enrollment,  
    Event,   
    LessonResource,  
    AppUser
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppUser 
        fields = ['name', 'email', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation.pop('password', None)
        return representation

    def create(self, validated_data):
        return AppUser.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
        )
    
class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.UUIDField()

class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()

class InstructorCourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'course_id', 
            'title', 
            'description', 
            'duration', 
            'level', 
            'prerequisites',
            'instructor_name',
            'created_at',
            'updated_at',
            'is_visible',  
            'visibility_start_date',
            'visibility_end_date'
        ]
        read_only_fields = ['instructor_name', 'created_at', 'updated_at']
    
    def get_instructor_name(self, obj):
        return obj.instructor.name
    
    def create(self, validated_data):
        instructor = self.context['request'].user
        validated_data['instructor'] = instructor
        return super().create(validated_data)
    
class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.SerializerMethodField()
    visibility_status = serializers.CharField(read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'course_id',
            'title',
            'description',
            'duration',
            'level',
            'prerequisites',
            'instructor_name',
            'created_at',
            'updated_at',
            'is_visible',
            'visibility_start_date',
            'visibility_end_date',
            'visibility_status'
        ]

    def get_instructor_name(self, obj):
        return obj.instructor.name if obj.instructor else None
    
    def validate(self, data):
        request = self.context.get('request')
        if request and getattr(request, 'user', None):
            if request.user.role != 'admin':
                raise serializers.ValidationError("Only admin users can create or modify courses.")
        
        start_date = data.get('visibility_start_date')
        end_date = data.get('visibility_end_date')
        
        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError({
                "visibility_end_date": "End date must be after start date"
            })
            
        return data

class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'enrollment_date']
        read_only_fields = ['enrollment_date']

class EventSerializer(serializers.ModelSerializer):  
    class Meta:
        model = Event  
        fields = ['event_id', 'title', 'description', 'start_time', 'end_time']


class CourseProgressSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = CourseProgress
        fields = ['course', 'user', 'progress_percentage']  

class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ['id', 'user', 'lesson', 'completed']

class LessonSerializer(serializers.ModelSerializer):
    completed = serializers.SerializerMethodField()  

    def get_completed(self, obj):
        user = self.context['request'].user
        return LessonProgress.objects.filter(user=user, lesson=obj, completed=True).exists()
    
    def validate_order(self, value):
        if value < 1:
            raise serializers.ValidationError("Order must be a positive number.")
        return value

    class Meta:
        model = Lesson
        fields = ['lesson_id', 'course', 'title', 'description', 'order', 'completed']
        extra_kwargs = {
            'title': {'required': True},
            'description': {'required': True},
            'order': {'required': True},
        }

class LessonResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonResource
        fields = ['id', 'title', 'file', 'resource_type', 'allow_preview', 
                 'uploaded_at', 'lesson']
        read_only_fields = ['uploaded_at', 'resource_type']

class LessonResourceBulkSerializer(serializers.Serializer):
    lesson = serializers.PrimaryKeyRelatedField(queryset=Lesson.objects.all())
    resources = serializers.ListField(
        child=serializers.FileField(
            max_length=None, 
            allow_empty_file=False
        ),
        write_only=True
    )
    titles = serializers.ListField(
        child=serializers.CharField(max_length=100),
        write_only=True
    )

    def validate(self, data):
        if len(data['resources']) != len(data['titles']):
            raise serializers.ValidationError("Number of titles must match number of files")
        
        max_size_mb = 10
        allowed_extensions = ['pdf', 'docx', 'pptx','jpg', 'jpeg', 'png']

        for file in data['resources']:
            if file.size > max_size_mb * 1024 * 1024:
                raise serializers.ValidationError(f'File size should not exceed {max_size_mb} MB.')

            file_extension = file.name.split('.')[-1].lower()
            if file_extension not in allowed_extensions:
                raise serializers.ValidationError(
                    f'Unsupported file type. Allowed types: {", ".join(allowed_extensions)}'
                )

        return data

    def create(self, validated_data):
        lesson = validated_data['lesson']
        resources = validated_data['resources']
        titles = validated_data['titles']
        
        created_resources = []
        
        for file, title in zip(resources, titles):
            resource = LessonResource.objects.create(
                lesson=lesson,
                file=file,
                title=title
            )
            created_resources.append(resource)
            
        return created_resources