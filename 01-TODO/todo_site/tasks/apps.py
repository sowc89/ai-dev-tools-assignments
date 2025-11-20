from django.apps import AppConfig


class TasksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tasks'

    def ready(self):
        # Start scheduler only when running the development server.
        # Avoid starting during migrations, createsuperuser, tests, etc.
        import sys, os

        runserver = 'runserver' in sys.argv or os.environ.get('RUN_MAIN') == 'true'
        if not runserver:
            return

        try:
            from . import scheduler  # registers jobs
        except Exception:
            # If scheduler fails to start, log it but don't crash the app startup.
            import logging
            logging.getLogger(__name__).exception('Failed to import/start scheduler')
