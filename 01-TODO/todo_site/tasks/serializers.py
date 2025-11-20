from rest_framework import serializers
from .models import Category, Task


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'category', 'category_id', 'created_at',
            'due_date', 'reminder_at', 'snooze_count', 'completed'
        ]
