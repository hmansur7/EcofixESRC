from django.core.management.base import BaseCommand
from content.models import AppUser
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Add default admin users to the database'

    def handle(self, *args, **kwargs):
        admins = [
            {
                'email': 'hmansur@admin.com',
                'name': 'Haarish',
                'password': 'admin',  # Change this to a secure password in production
                'role': 'admin'
            }
        ]

        for admin in admins:
            if not AppUser.objects.filter(email=admin['email']).exists():
                User.objects.create_user(
                    email=admin['email'],
                    name=admin['name'],
                    password=admin['password'],
                    role=admin['role']
                )
                self.stdout.write(self.style.SUCCESS(f"Admin user '{admin['name']}' added successfully."))
            else:
                self.stdout.write(self.style.WARNING(f"Admin user '{admin['name']}' already exists."))
