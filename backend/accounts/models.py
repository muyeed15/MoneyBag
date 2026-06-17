from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError("Phone number is required.")
        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(phone, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("individual", "Individual"),
        ("foundation", "Foundation"),
    ]

    phone = models.CharField(max_length=15, unique=True)
    full_name = models.CharField(max_length=100)
    nid = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="individual")
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = ["full_name", "nid"]

    objects = UserManager()

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-created_at"]

    def __str__(self):
        return self.phone


class Wallet(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("frozen", "Frozen"),
    ]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="wallet"
    )
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    daily_limit = models.DecimalField(max_digits=12, decimal_places=2, default=10000.00)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Wallet"
        verbose_name_plural = "Wallets"

    def __str__(self):
        return f"{self.user.phone} - {self.balance}"


class Foundation(models.Model):
    CAUSE_CHOICES = [
        ("education", "Education"),
        ("health", "Health"),
        ("poverty", "Poverty Alleviation"),
        ("orphan", "Orphan Support"),
        ("masjid", "Masjid Development"),
        ("water", "Water & Sanitation"),
        ("emergency", "Emergency Relief"),
        ("general", "General"),
    ]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="foundation_profile"
    )
    organization_name = models.CharField(max_length=200)
    registration_number = models.CharField(max_length=50, unique=True)
    cause = models.CharField(max_length=20, choices=CAUSE_CHOICES)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=15, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Foundation"
        verbose_name_plural = "Foundations"
        ordering = ["organization_name"]

    def __str__(self):
        return self.organization_name
