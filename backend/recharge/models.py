from django.conf import settings
from django.db import models


class Operator(models.Model):
    TYPE_CHOICES = [
        ("prepaid", "Prepaid"),
        ("postpaid", "Postpaid"),
        ("both", "Both"),
    ]

    name = models.CharField(max_length=100)
    operator_code = models.CharField(max_length=10, unique=True)
    logo = models.URLField(blank=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default="prepaid")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Operator"
        verbose_name_plural = "Operators"
        ordering = ["name"]

    def __str__(self):
        return self.name


class DataPack(models.Model):
    operator = models.ForeignKey(
        Operator, on_delete=models.CASCADE, related_name="data_packs"
    )
    name = models.CharField(max_length=100)
    volume = models.CharField(max_length=50)
    validity_days = models.PositiveIntegerField()
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Data Pack"
        verbose_name_plural = "Data Packs"
        ordering = ["amount"]

    def __str__(self):
        return f"{self.operator.name} - {self.name}"


class RechargeTransaction(models.Model):
    TYPE_CHOICES = [
        ("prepaid", "Prepaid Recharge"),
        ("postpaid", "Postpaid Bill"),
        ("data_pack", "Data Pack"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recharge_transactions",
    )
    operator = models.ForeignKey(
        Operator, on_delete=models.PROTECT, related_name="recharges"
    )
    phone_number = models.CharField(max_length=15)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    fee = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    recharge_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default="prepaid")
    data_pack = models.ForeignKey(
        DataPack, on_delete=models.SET_NULL, null=True, blank=True, related_name="recharges"
    )
    reference = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Recharge Transaction"
        verbose_name_plural = "Recharge Transactions"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.user.phone} - {self.operator.name} - ৳{self.amount}"
