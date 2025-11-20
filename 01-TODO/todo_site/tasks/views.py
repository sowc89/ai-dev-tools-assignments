from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

from .models import Category, Task
from .serializers import CategorySerializer, TaskSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('-created_at')
    serializer_class = CategorySerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer

    @action(detail=True, methods=['post'])
    def snooze(self, request, pk=None):
        """Snooze the task by a number of minutes (passed as `minutes`), or set datetime via `reminder_at`."""
        task = self.get_object()
        minutes = request.data.get('minutes')
        reminder_at = request.data.get('reminder_at')

        if minutes is not None:
            try:
                minutes = int(minutes)
            except Exception:
                return Response({'detail': 'minutes must be an integer'}, status=status.HTTP_400_BAD_REQUEST)
            task.snooze(timedelta(minutes=minutes))
            return Response(self.get_serializer(task).data)

        if reminder_at:
            # let DRF/serializer coerce; we'll parse ISO datetime
            try:
                from django.utils.dateparse import parse_datetime

                dt = parse_datetime(reminder_at)
                if dt is None:
                    raise ValueError
                task.snooze(dt)
            except Exception:
                return Response({'detail': 'invalid reminder_at'}, status=status.HTTP_400_BAD_REQUEST)
            return Response(self.get_serializer(task).data)

        return Response({'detail': 'provide minutes or reminder_at'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.completed = True
        task.save(update_fields=['completed'])
        return Response(self.get_serializer(task).data)
