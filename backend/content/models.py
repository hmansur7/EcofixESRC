from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
import os

class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field is required")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if not extra_fields.get('is_staff'):
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields.get('is_superuser'):
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, name, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=[('user', 'User'), ('admin', 'Admin')], default='user')
    
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

class Courses(models.Model):
    course_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.title

class Lessons(models.Model):
    lesson_id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Courses, on_delete=models.CASCADE, related_name='lessons')  
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)  
    content = models.TextField(null=True, blank=True)  
    order = models.PositiveIntegerField(default=0)  

    def __str__(self):
        return f"Lesson: {self.title} (Course: {self.course.title})"

# Added LessonResources model
class LessonResources(models.Model):
    title = models.CharField(max_length=100)
    file = models.FileField(
        upload_to='lesson_resources/', 
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'zip', 'jpg', 'jpeg', 'png', 'docx', 'pptx', 'xlsx'])]
        )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    lesson = models.ForeignKey(Lessons, on_delete=models.CASCADE, related_name='resources')

    def __str__(self):
        return f"{self.title} - {os.path.basename(self.file.name)}"

class CourseProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Courses, on_delete=models.CASCADE)
    progress_percentage = models.FloatField(default=0.0) 

    def __str__(self):
        return f"{self.user.name} - {self.course.title} - {self.progress_percentage}%"

class LessonProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lessons, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)  

    def __str__(self):
        return f"{self.user.name} - {self.lesson.title} - {'Completed' if self.completed else 'Not Completed'}"

class Events(models.Model):
    event_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    attendees = models.ManyToManyField(User, related_name='events_signed_up', blank=True)

    def clean(self):
        if self.end_time <= self.start_time:
            raise ValidationError('End time must be after start time.')

    def __str__(self):
        return f"{self.title} on {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}"


class Registration(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='registrations')
    event = models.ForeignKey(Events, on_delete=models.CASCADE, related_name='registrations')

    def __str__(self):
        return f"{self.user.name} registered for {self.event.title}"

    class Meta:
        unique_together = ('user', 'event') 