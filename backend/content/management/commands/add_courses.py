from django.core.management.base import BaseCommand
from content.models import Courses

class Command(BaseCommand):
    help = 'Add initial course data to the database'

    def handle(self, *args, **kwargs):
        courses = [
            Courses(title='Introduction to Solar Energy', description='Learn about the basics of solar energy.'),
            Courses(title='Wind Energy Basics', description='An overview of wind energy and turbines.'),
            Courses(title='Climate Change Webinar', description='Join our webinar on climate change.'),
            Courses(title='Guide to Recycling', description='A complete guide to recycling effectively.')
        ]
        Courses.objects.bulk_create(courses)
        self.stdout.write(self.style.SUCCESS("Courses added successfully!"))