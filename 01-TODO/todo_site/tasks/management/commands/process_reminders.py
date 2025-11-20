from django.core.management.base import BaseCommand
from django.utils import timezone

from tasks.models import Task


class Command(BaseCommand):
    help = 'Find tasks with reminders due and output notifications to console'

    def handle(self, *args, **options):
        now = timezone.now()
        qs = Task.objects.filter(reminder_at__isnull=False, reminder_at__lte=now, completed=False)
        if not qs.exists():
            self.stdout.write('No reminders due at %s' % now)
            return

        for task in qs:
            # For now, print to console. Replace with email/push when configured.
            self.stdout.write(f'Reminder: Task #{task.id} "{task.title}" is due (reminder_at={task.reminder_at})')
            # After notifying, clear reminder to avoid re-notifying repeatedly. Uncomment if desired:
            # task.reminder_at = None
            # task.save(update_fields=['reminder_at'])
