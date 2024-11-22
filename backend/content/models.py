from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.exceptions import ValidationError
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
    course = models.ForeignKey(Courses, on_delete=models.CASCADE, related_name='lessons')  # ForeignKey to Courses model
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)  # Optional description of the lesson
    content = models.TextField(null=True, blank=True)  # You can store text content, or this could be replaced with a file field
    order = models.PositiveIntegerField(default=0)  # Order of lessons in a course (useful for sequencing lessons)
    
    def __str__(self):
        return f"Lesson: {self.title} (Course: {self.course.title})"

class CourseProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Courses, on_delete=models.CASCADE)
    progress_percentage = models.FloatField(default=0.0)  # Store progress percentage

    def __str__(self):
        return f"{self.user.name} - {self.course.title} - {self.progress_percentage}%"

class LessonProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lessons, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)  # Track whether the lesson is completed

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
