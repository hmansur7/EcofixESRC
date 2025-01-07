# add_admins.py
from django.core.management.base import BaseCommand
from content.models import AppUser, EmailVerificationToken
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Add default admin users to the database'

    def handle(self, *args, **kwargs):
        admins = [
            {
                'email': 'admin@test.com',
                'name': 'Test Admin',
                'password': 'TestAdmin123!',  # Simpler password for testing
                'role': 'admin'
            }
        ]

        for admin in admins:
            try:
                with transaction.atomic():
                    if not AppUser.objects.filter(email=admin['email']).exists():
                        user = User.objects.create_user(
                            email=admin['email'],
                            name=admin['name'],
                            password=admin['password'],
                            role=admin['role'],
                            is_verified=True,
                            is_superuser=True
                        )
                        
                        verification_token = EmailVerificationToken.objects.create(
                            user=user,
                            is_used=True
                        )

                        self.stdout.write(
                            self.style.SUCCESS(
                                f"Admin user '{admin['name']}' added and verified successfully."
                            )
                        )
                    else:
                        user = AppUser.objects.get(email=admin['email'])
                        user.is_verified = True
                        user.is_staff = True
                        user.is_superuser = True
                        user.role = 'admin'
                        user.save()
                        
                        self.stdout.write(
                            self.style.WARNING(
                                f"Admin user '{admin['name']}' already exists. Updated permissions."
                            )
                        )

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f"Failed to process admin user '{admin['name']}': {str(e)}"
                    )
                )

        self.stdout.write(self.style.SUCCESS("Admin user creation completed."))