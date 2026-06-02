from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class ActiveCardManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(status="active")


class Card(models.Model):
    CARD_TYPE_CHOICES = [
        ("debit", "Debit Card"),
        ("prepaid", "Prepaid Card"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("blocked", "Blocked"),
        ("expired", "Expired"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cards",
    )
    last_four = models.CharField(max_length=4)
    card_type = models.CharField(
        max_length=10, choices=CARD_TYPE_CHOICES, default="debit"
    )
    expiry_month = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)]
    )
    expiry_year = models.PositiveSmallIntegerField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()
    active = ActiveCardManager()

    class Meta:
        verbose_name = "Card"
        verbose_name_plural = "Cards"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["status"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(expiry_month__gte=1, expiry_month__lte=12),
                name="card_valid_expiry_month",
            ),
        ]

    def __str__(self):
        return f"{self.user.phone} - **** {self.last_four} ({self.card_type})"
