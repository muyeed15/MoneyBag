import os

from django.core.exceptions import ImproperlyConfigured
from django.core.management.commands.runserver import Command as BaseCommand


class Command(BaseCommand):
    help = "Starts a lightweight development server on the configured port (DJANGO_PORT / BACKEND_PORT)."

    def handle(self, *args, **options):
        if not options.get("addrport"):
            try:
                port = os.environ["DJANGO_PORT"]
                host = os.environ["BACKEND_HOST"]
            except KeyError as error:
                raise ImproperlyConfigured(
                    f"{error.args[0]} must be set in backend/.env"
                ) from error
            options["addrport"] = f"{host}:{port}"
        return super().handle(*args, **options)
