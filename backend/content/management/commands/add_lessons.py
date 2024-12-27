from django.core.management.base import BaseCommand
from content.models import Course, Lesson

class Command(BaseCommand):
    help = 'Add lessons to existing courses in the database'

    def handle(self, *args, **kwargs):
        lesson_data = {
            'Introduction to Solar Energy': [
                {"title": "What is Solar Energy?", "description": "An introduction to solar energy concepts."},
                {"title": "How Solar Panels Work", "description": "Understand the working mechanism of solar panels."},
                {"title": "Advantages of Solar Energy", "description": "Explore the benefits of solar energy."},
            ],
            'Wind Energy Basics': [
                {"title": "Understanding Wind Turbines", "description": "Learn how wind turbines generate energy."},
                {"title": "Wind Power Potential", "description": "Explore the potential of wind power in energy production."},
                {"title": "Challenges in Wind Energy", "description": "Understand the challenges faced in wind energy."},
            ],
            'Climate Change Webinar': [
                {"title": "Causes of Climate Change", "description": "Discuss the main causes of climate change."},
                {"title": "Impacts of Climate Change", "description": "Explore the effects of climate change globally."},
                {"title": "Solutions to Climate Change", "description": "Identify actionable solutions for climate change."},
            ],
            'Guide to Recycling': [
                {"title": "Why Recycling Matters", "description": "Understand the importance of recycling."},
                {"title": "Recycling Techniques", "description": "Learn effective techniques for recycling."},
                {"title": "Composting Basics", "description": "A guide to composting organic waste."},
            ],
        }

        courses = Course.objects.all()

        for course in courses:
            if course.title in lesson_data:
                self.stdout.write(f"Adding lessons to course: {course.title}")
                lessons = [
                    Lesson(
                        course=course,
                        title=lesson["title"],
                        description=lesson["description"],
                        order=index + 1  
                    )
                    for index, lesson in enumerate(lesson_data[course.title])
                ]
                Lesson.objects.bulk_create(lessons, ignore_conflicts=True)
                self.stdout.write(self.style.SUCCESS(f"Lessons added to {course.title} with correct order"))
            else:
                self.stdout.write(self.style.WARNING(f"No lesson data found for course: {course.title}"))
