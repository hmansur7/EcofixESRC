from django.core.management.base import BaseCommand
from content.models import Lessons, Courses  # Import your Lessons and Courses models

class Command(BaseCommand):
    help = 'Add lessons to the "Intro to Solar Energy" course (course_id=5)'

    def handle(self, *args, **kwargs):
        # Specify the course_id for "Intro to Solar Energy"
        course_id = 5
        course = Courses.objects.get(course_id=course_id)

        # List of lesson titles and content related to "Intro to Solar Energy"
        lesson_data = [
            {"title": "Introduction to Solar Energy", "description": "Learn the basics of solar energy, its benefits, and applications.", "content": "Solar energy is energy harnessed from the sun's rays, and it can be converted into electricity or heat.", "order": 1},
            {"title": "Solar Panels and Photovoltaics", "description": "Understanding solar panels and how photovoltaics work.", "content": "Solar panels are made up of photovoltaic cells that convert sunlight into electricity.", "order": 2},
            {"title": "Solar Energy Conversion", "description": "How solar energy is converted into usable energy.", "content": "Solar energy can be converted into electrical energy through photovoltaic cells or into heat energy using solar thermal systems.", "order": 3},
            {"title": "Types of Solar Energy Systems", "description": "Exploring different types of solar energy systems: grid-tied, off-grid, and hybrid systems.", "content": "Grid-tied systems are connected to the electrical grid, off-grid systems operate independently, and hybrid systems combine both approaches.", "order": 4},
            {"title": "Designing a Solar Energy System", "description": "How to design an efficient solar energy system based on energy needs.", "content": "When designing a solar system, it’s important to assess factors like energy usage, location, available sunlight, and available space.", "order": 5},
            {"title": "Solar Energy Storage", "description": "Exploring energy storage systems like batteries to store solar power.", "content": "Solar energy storage involves using batteries to store excess energy produced during sunny periods for later use.", "order": 6},
            {"title": "Environmental Impact of Solar Energy", "description": "Learn about the environmental benefits and challenges of solar energy.", "content": "Solar energy is a clean, renewable source of energy, but it has environmental impacts related to manufacturing and disposal of solar panels.", "order": 7},
            {"title": "Solar Energy and the Future", "description": "Looking at the future of solar energy and technological advancements.", "content": "With continuous innovation, solar energy is becoming more efficient and affordable, making it a key player in the future of renewable energy.", "order": 8},
        ]
        
        # Add each lesson to the database
        for lesson in lesson_data:
            lesson_instance = Lessons.objects.create(
                course=course,
                title=lesson["title"],
                description=lesson["description"],
                content=lesson["content"],
                order=lesson["order"]
            )
            self.stdout.write(self.style.SUCCESS(f'Successfully added lesson: {lesson["title"]}'))

