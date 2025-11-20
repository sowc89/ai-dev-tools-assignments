from django.contrib import admin
from .models import Category, Task


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name',)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'due_date', 'reminder_at', 'completed', 'snooze_count')
    list_filter = ('completed', 'category')
    search_fields = ('title', 'description')
