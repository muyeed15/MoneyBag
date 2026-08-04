import os

from django.core.management.commands.runserver import Command as BaseCommand


class Command(BaseCommand):
    help = "Starts a lightweight development server on the configured port (DJANGO_PORT / BACKEND_PORT)."

    def handle(self, *args, **options):
        if not options.get("addrport"):
            port = os.environ.get(
                "DJANGO_PORT", os.environ.get("BACKEND_PORT", "8003")
            )
            host = os.environ.get("BACKEND_HOST", "127.0.0.1")
            options["addrport"] = f"{host}:{port}"
        return super().handle(*args, **options)
