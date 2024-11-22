
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.core.exceptions import ValidationError
import os

class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field is required")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)  # Hash the password
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=[('user', 'User'), ('admin', 'Admin')], default='user')

    objects = UserManager()

    USERNAME_FIELD = 'email'  # Use email to log in
    REQUIRED_FIELDS = ['name']  # Other required fields

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
        """
        Custom validation to ensure that the file type matches the resource_type.
        """
        if self.attachment:
            # Get the file extension (in lowercase) from the uploaded file's name
            file_extension = os.path.splitext(self.attachment.name)[1][1:].lower()

            # Check if the resource type matches the file extension
            if self.resource_type == 'pdf' and file_extension != 'pdf':
                raise ValidationError('File must be a PDF.')
            elif self.resource_type == 'docx' and file_extension != 'docx':
                raise ValidationError('File must be a DOCX document.')
            elif self.resource_type == 'pptx' and file_extension != 'pptx':
                raise ValidationError('File must be a PPTX presentation.')
            elif self.resource_type == 'txt' and file_extension != 'txt':
                raise ValidationError('File must be a TXT text file.')
            elif self.resource_type == 'jpg' and file_extension not in ['jpg', 'jpeg']:
                raise ValidationError('File must be a JPG image.')
            elif self.resource_type == 'png' and file_extension != 'png':
                raise ValidationError('File must be a PNG image.')
            elif self.resource_type == 'mp4' and file_extension != 'mp4':
                raise ValidationError('File must be an MP4 video.')
    
    def __str__(self):
        return f"{self.title} - {self.resource_type}"

class Events(models.Model):
    event_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    start_time = models.DateTimeField()  # Start date and time of the event
    end_time = models.DateTimeField()  # End date and time of the event
    attendees = models.ManyToManyField(User, related_name='events_signed_up', blank=True)

    def __str__(self):
        return f"{self.title} on {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}"

    def clean(self):
        """
        Custom validation to ensure end time is after start time.
        """
        if self.end_time <= self.start_time:
            raise ValidationError('End time must be after start time.')
        
class Progress(models.Model):
    progress_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progresses')  # Link to a user (student)
    course = models.ForeignKey(Courses, on_delete=models.CASCADE, related_name='progress')  # Link to a course
    completion_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # Completion percentage (e.g., 85.75%)

    def __str__(self):
        return f"{self.user.name} - {self.course.title} - {self.completion_percentage}%"

    class Meta:
        unique_together = ('user', 'course')  # Ensure one progress record per user and course combination
