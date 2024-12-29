# models.py 
import os
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.core.validators import FileExtensionValidator
from django.utils import timezone
import uuid

USER_ROLES = [
    ('user', 'User'),
    ('admin', 'Admin'),
]

class UserManager(models.Manager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field is required")
        self.validate_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def validate_email(self, email):
        from django.core.validators import validate_email as django_validate_email
        try:
            django_validate_email(email)
        except ValidationError:
            raise ValueError("Invalid email format")

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if not extra_fields.get('is_staff'):
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields.get('is_superuser'):
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, name, password, **extra_fields)

    def get_by_natural_key(self, username):
        return self.get(**{self.model.USERNAME_FIELD: username})
    

class AppUser(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=255, null=False, blank=False)
    email = models.EmailField(unique=True, null=False, blank=False)
    role = models.CharField(max_length=10, choices=USER_ROLES, default='user', null=False, blank=False)
    
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    is_verified = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'content_appuser'
        verbose_name = 'user'
        verbose_name_plural = 'users'
    
    def __str__(self):
        return self.email

class EmailVerificationToken(models.Model):
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(hours=24)
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_used and timezone.now() <= self.expires_at
    
class Course(models.Model):
    course_id = models.AutoField(primary_key=True, null=False, blank=False)
    title = models.CharField(max_length=255, null=False, blank=False, unique=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.title

class Lesson(models.Model):
    lesson_id = models.AutoField(primary_key=True, null=False, blank=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')  
    title = models.CharField(max_length=255, null=False, blank=False)
    description = models.TextField(null=True, blank=True)    
    order = models.PositiveIntegerField(default=0, null=False, blank=False)  

    def __str__(self):
        return f"Lesson: {self.title} (Course: {self.course.title})"

class LessonResource(models.Model):
    title = models.CharField(max_length=100, null=False, blank=False)
    file = models.FileField(
        upload_to='lesson_resources/', 
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'zip', 'jpg', 'jpeg', 'png', 'docx', 'pptx', 'xlsx'])]
        )
    uploaded_at = models.DateTimeField(auto_now_add=True, null=False, blank=False)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='resources', null=False, blank=False)

    def __str__(self):
        return f"{self.title} - {os.path.basename(self.file.name)}"

class CourseProgress(models.Model):
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    progress_percentage = models.FloatField(default=0.0, null=False, blank=False) 

    def __str__(self):
        return f"{self.user.name} - {self.course.title} - {self.progress_percentage}%"

class LessonProgress(models.Model):
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.name} - {self.lesson.title} - {'Completed' if self.completed else 'Not Completed'}"

class Event(models.Model):
    event_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=50, null=False, blank=False)
    description = models.TextField(null=True, blank=True)
    start_time = models.DateTimeField(null=False, blank=False)
    end_time = models.DateTimeField(null=False, blank=False)
    attendees = models.ManyToManyField(AppUser, related_name='events', blank=True)

    def clean(self):
        if self.end_time <= self.start_time:
            raise ValidationError('End time must be after start time.')

    def __str__(self):
        return f"{self.title} on {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}"

class Registrations(models.Model):
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name='registrations')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')

    def __str__(self):
        return f"{self.user.name} registered for {self.event.title}"

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'event'], name='unique_user_event')
        ]
