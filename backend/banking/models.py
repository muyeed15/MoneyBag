import uuid

from django.conf import settings
from django.db import models


class Bank(models.Model):
    name = models.CharField(max_length=100)
    bank_code = models.CharField(max_length=10, unique=True)
    logo = models.URLField(blank=True)
    is_islamic = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Bank"
        verbose_name_plural = "Banks"
        ordering = ["name"]

    def __str__(self):
        return self.name


class BankAccount(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bank_accounts",
    )
    bank = models.ForeignKey(Bank, on_delete=models.PROTECT, related_name="accounts")
    account_number = models.CharField(max_length=30)
    account_holder = models.CharField(max_length=100)
    branch = models.CharField(max_length=100, blank=True)
    routing_number = models.CharField(max_length=15, blank=True)
    is_primary = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Bank Account"
        verbose_name_plural = "Bank Accounts"
        ordering = ["-created_at"]
        unique_together = [["user", "bank", "account_number"]]

    def __str__(self):
        return f"{self.bank.name} - {self.account_number}"


class BankTransaction(models.Model):
    TYPE_CHOICES = [
        ("add_money", "Add Money"),
        ("withdraw", "Withdraw"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bank_transactions",
    )
    bank_account = models.ForeignKey(
        BankAccount, on_delete=models.PROTECT, related_name="transactions"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    fee = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    transaction_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    reference = models.CharField(max_length=50, unique=True, editable=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Bank Transaction"
        verbose_name_plural = "Bank Transactions"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
        ]

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = "BNK" + uuid.uuid4().hex[:12].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.user.phone} - ৳{self.amount}"
