from django.db import models
from django.conf import settings


class Wallet(models.Model):
    # Setting imported to avoid circular import issues

    STATUS_CHOICES = [
        ("active", "Active"),
        ("frozen", "Frozen"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wallet"
    )
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    daily_limit = models.DecimalField(max_digits=12, decimal_places=2, default=10000.00)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.phone} - {self.balance}"
