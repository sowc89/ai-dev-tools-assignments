"""Register scheduled jobs using django-apscheduler.

This file registers a job that runs every minute and calls the reminder processor.
"""
from django_apscheduler.jobstores import DjangoJobStore
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def process_reminders_job():
    from django.utils import timezone
    from .models import Task

    now = timezone.now()
    qs = Task.objects.filter(reminder_at__isnull=False, reminder_at__lte=now, completed=False)
    for task in qs:
        # Simple console notification. Swap out with email/push later.
        logger.info(f'[Reminder] Task #{task.id} "{task.title}" reminder_at={task.reminder_at}')


def register_jobs():
    # In development, avoid using the database-backed jobstore because it
    # frequently writes job state and can cause SQLITE "database is locked" errors
    # under concurrent access. Use in-memory jobstore when DEBUG.
    scheduler = BackgroundScheduler()
    if not settings.DEBUG:
        scheduler.add_jobstore(DjangoJobStore(), 'default')

    # Run every minute
    scheduler.add_job(
        process_reminders_job,
        trigger=CronTrigger(minute='*'),
        id='process_reminders',
        replace_existing=True,
    )

    try:
        scheduler.start()
        logger.info('Scheduler started')
    except Exception as exc:
        logger.exception('Failed to start scheduler: %s', exc)


register_jobs()
