
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field is required")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)  # Hash the password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, name, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=[('user', 'User'), ('admin', 'Admin')], default='user')
    created_at = models.DateTimeField(auto_now_add=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'  # Use email to log in
    REQUIRED_FIELDS = ['name']  # Other required fields

    def __str__(self):
        return self.email


class Content(models.Model):
    content_id = models.AutoField(primary_key=True)  
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    content_type = models.CharField(
        max_length=50,
        choices=[
            ('Article', 'Article'),
            ('Video', 'Video'),
            ('Webinar', 'Webinar'),
            ('Guide', 'Guide'),
        ],
    )
    url = models.URLField(max_length=2083)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'content' 

    def __str__(self):
        return self.title


class UserProgress(models.Model):
    STATUS_CHOICES = [
        ('Not Started', 'Not Started'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name='progress')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Not Started')
    last_accessed = models.DateTimeField(auto_now=True)
    points_earned = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user.name} - {self.content.title} ({self.status})"


class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    event_date = models.DateTimeField()
    capacity = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class EventRegistration(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='registrations')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    registration_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.name} registered for {self.event.title}"


class AdminContentManagement(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)

    def __str__(self):
        return self.name
