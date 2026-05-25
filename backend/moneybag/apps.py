from django.apps import AppConfig


class MoneybagConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "moneybag"

    def ready(self):
        import moneybag.signals  # noqa: F401
