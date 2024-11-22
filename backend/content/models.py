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

class Resources(models.Model):
    resource_id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Courses, on_delete=models.CASCADE, related_name='resources')
    resource_type = models.CharField(max_length=10, choices=[
        ('pdf', 'PDF'),
        ('docx', 'Word Document (DOCX)'),
        ('pptx', 'PowerPoint (PPTX)'),
        ('txt', 'Text File (TXT)'),
        ('jpg', 'JPEG Image'),
        ('png', 'PNG Image'),
        ('mp4', 'MP4 Video'),
        ('weburl', 'Website'),
        ('other', 'Other'),
    ], default='other')
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    attachment = models.FileField(upload_to='resources/attachments/', null=True, blank=True)

    def clean(self):
        if self.attachment:
            file_extension = os.path.splitext(self.attachment.name)[1][1:].lower()
            if self.resource_type == 'pdf' and file_extension != 'pdf':
                raise ValidationError('File must be a PDF.')
            # Add other validation cases as necessary

    def __str__(self):
        return f"{self.title} - {self.resource_type}"

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

class Progress(models.Model):
    progress_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progresses')
    course = models.ForeignKey(Courses, on_delete=models.CASCADE, related_name='progress')
    completion_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'course'], name='unique_user_course_progress')
        ]

    def __str__(self):
        return f"{self.user.name} - {self.course.title} - {self.completion_percentage}%"
