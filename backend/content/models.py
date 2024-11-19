from django.db import models

class User(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Content(models.Model):
    CONTENT_TYPES = [
        ('Article', 'Article'),
        ('Video', 'Video'),
        ('Webinar', 'Webinar'),
        ('Guide', 'Guide'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    url = models.URLField(max_length=2083)
    created_at = models.DateTimeField(auto_now_add=True)

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
