from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "moneybag"

    def ready(self):
        import moneybag.signals
