from django.test import TestCase
from django.utils import timezone
from datetime import timedelta, datetime
from django.urls import reverse
from rest_framework.test import APIClient
from django.core.management import call_command
from io import StringIO

from .models import Category, Task


class TaskModelTests(TestCase):
    def test_snooze_with_timedelta_sets_reminder_and_increments_count(self):
        t = Task.objects.create(title='Test', description='x')
        self.assertIsNone(t.reminder_at)
        delta = timedelta(minutes=15)
        before = timezone.now()
        t.snooze(delta)
        self.assertIsNotNone(t.reminder_at)
        # reminder_at should be >= before + delta - small delta for timing
        self.assertTrue(t.reminder_at >= before + delta - timedelta(seconds=1))
        self.assertEqual(t.snooze_count, 1)

    def test_snooze_with_datetime_sets_exact_value(self):
        t = Task.objects.create(title='Test2', description='y')
        target = timezone.now() + timedelta(hours=1)
        t.snooze(target)
        # Allow small microsecond differences if timezone naive/aware conversions occur
        self.assertEqual(t.reminder_at.replace(microsecond=0), target.replace(microsecond=0))
        self.assertEqual(t.snooze_count, 1)


class TaskAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cat = Category.objects.create(name='Work')
        self.task = Task.objects.create(title='API Task', description='api', category=self.cat)

    def test_snooze_endpoint_with_minutes(self):
        url = reverse('task-detail', args=[self.task.id]) + 'snooze/'
        resp = self.client.post(url, {'minutes': 10}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.task.refresh_from_db()
        self.assertEqual(self.task.snooze_count, 1)
        self.assertIsNotNone(self.task.reminder_at)

    def test_complete_endpoint_marks_completed(self):
        url = reverse('task-detail', args=[self.task.id]) + 'complete/'
        resp = self.client.post(url, {}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.task.refresh_from_db()
        self.assertTrue(self.task.completed)


class RemindersCommandTests(TestCase):
    def test_process_reminders_outputs_due_tasks(self):
        # create one due task and one future task
        due = Task.objects.create(title='Due', reminder_at=timezone.now() - timedelta(minutes=1))
        future = Task.objects.create(title='Future', reminder_at=timezone.now() + timedelta(days=1))

        out = StringIO()
        call_command('process_reminders', stdout=out)
        output = out.getvalue()
        self.assertIn(f'Reminder: Task #{due.id}', output)
        self.assertNotIn(f'Reminder: Task #{future.id}', output)
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta, datetime
from django.urls import reverse
from rest_framework.test import APIClient
from django.core.management import call_command
from io import StringIO

from .models import Category, Task


class TaskModelTests(TestCase):
    def test_snooze_with_timedelta_sets_reminder_and_increments_count(self):
        t = Task.objects.create(title='Test', description='x')
        self.assertIsNone(t.reminder_at)
        delta = timedelta(minutes=15)
        before = timezone.now()
        t.snooze(delta)
        self.assertIsNotNone(t.reminder_at)
        # reminder_at should be >= before + delta - small delta for timing
        self.assertTrue(t.reminder_at >= before + delta - timedelta(seconds=1))
        self.assertEqual(t.snooze_count, 1)

    def test_snooze_with_datetime_sets_exact_value(self):
        t = Task.objects.create(title='Test2', description='y')
        target = timezone.now() + timedelta(hours=1)
        t.snooze(target)
        # Allow small microsecond differences if timezone naive/aware conversions occur
        self.assertEqual(t.reminder_at.replace(microsecond=0), target.replace(microsecond=0))
        self.assertEqual(t.snooze_count, 1)


class TaskAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cat = Category.objects.create(name='Work')
        self.task = Task.objects.create(title='API Task', description='api', category=self.cat)

    def test_snooze_endpoint_with_minutes(self):
        url = reverse('task-detail', args=[self.task.id]) + 'snooze/'
        resp = self.client.post(url, {'minutes': 10}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.task.refresh_from_db()
        self.assertEqual(self.task.snooze_count, 1)
        self.assertIsNotNone(self.task.reminder_at)

    def test_complete_endpoint_marks_completed(self):
        url = reverse('task-detail', args=[self.task.id]) + 'complete/'
        resp = self.client.post(url, {}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.task.refresh_from_db()
        self.assertTrue(self.task.completed)


class RemindersCommandTests(TestCase):
    def test_process_reminders_outputs_due_tasks(self):
        # create one due task and one future task
        due = Task.objects.create(title='Due', reminder_at=timezone.now() - timedelta(minutes=1))
        future = Task.objects.create(title='Future', reminder_at=timezone.now() + timedelta(days=1))

        out = StringIO()
        call_command('process_reminders', stdout=out)
        output = out.getvalue()
        self.assertIn(f'Reminder: Task #{due.id}', output)
        self.assertNotIn(f'Reminder: Task #{future.id}', output)
