from django.conf import settings
from django.db import models


class VerifiedMerchantManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_verified=True)


class Merchant(models.Model):
    CATEGORY_CHOICES = [
        ("retail", "Retail"),
        ("food", "Food & Beverage"),
        ("transport", "Transport"),
        ("utility", "Utility"),
        ("health", "Health & Pharmacy"),
        ("education", "Education"),
        ("entertainment", "Entertainment"),
        ("other", "Other"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="merchant_profile",
    )
    business_name = models.CharField(max_length=150)
    category = models.CharField(
        max_length=15, choices=CATEGORY_CHOICES, default="other"
    )
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()
    verified = VerifiedMerchantManager()

    class Meta:
        verbose_name = "Merchant"
        verbose_name_plural = "Merchants"
        ordering = ["business_name"]
        indexes = [
            models.Index(fields=["category", "is_verified"]),
            models.Index(fields=["is_verified"]),
        ]

    def __str__(self):
        return f"{self.business_name} ({self.get_category_display()})"
