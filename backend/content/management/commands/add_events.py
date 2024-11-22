from django.core.management.base import BaseCommand
from content.models import Events
from django.utils.timezone import make_aware
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Add company events to the database'

    def handle(self, *args, **kwargs):
        # Define the events to add
        events_data = [
            {
                'title': 'Annual Company Retreat',
                'description': 'A weekend retreat for team-building and relaxation.',
                'start_time': make_aware(datetime(2024, 12, 15, 9, 0)),
                'end_time': make_aware(datetime(2024, 12, 17, 17, 0)),
            },
            {
                'title': 'Quarterly Sales Meeting',
                'description': 'Discussion on sales targets and achievements for Q4.',
                'start_time': make_aware(datetime(2024, 12, 5, 14, 0)),
                'end_time': make_aware(datetime(2024, 12, 5, 16, 0)),
            },
            {
                'title': 'Holiday Party',
                'description': 'Celebrate the holiday season with food, music, and fun!',
                'start_time': make_aware(datetime(2024, 12, 20, 18, 0)),
                'end_time': make_aware(datetime(2024, 12, 20, 22, 0)),
            },
            {
                'title': 'Training Workshop',
                'description': 'Hands-on workshop to improve technical skills.',
                'start_time': make_aware(datetime(2024, 12, 10, 10, 0)),
                'end_time': make_aware(datetime(2024, 12, 10, 15, 0)),
            },
        ]

        # Create events in the database
        for event_data in events_data:
            event, created = Events.objects.get_or_create(
                title=event_data['title'],
                defaults={
                    'description': event_data['description'],
                    'start_time': event_data['start_time'],
                    'end_time': event_data['end_time'],
                },
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Event '{event.title}' added successfully."))
            else:
                self.stdout.write(self.style.WARNING(f"Event '{event.title}' already exists."))
