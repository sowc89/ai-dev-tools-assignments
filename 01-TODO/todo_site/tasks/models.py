from django.db import models
from django.utils import timezone


class Category(models.Model):
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    reminder_at = models.DateTimeField(null=True, blank=True)
    snooze_count = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)

    def snooze(self, delta):
        """Snooze the reminder by a datetime.timedelta `delta` or set directly if `delta` is a datetime."""
        from datetime import datetime, timedelta

        if self.reminder_at is None:
            # if no reminder set, set to now + delta
            base = timezone.now()
        else:
            base = self.reminder_at

        if isinstance(delta, timedelta):
            self.reminder_at = base + delta
        elif isinstance(delta, datetime):
            self.reminder_at = delta
        else:
            raise TypeError('delta must be timedelta or datetime')

        self.snooze_count += 1
        self.save(update_fields=['reminder_at', 'snooze_count'])

    def __str__(self):
        return self.title
