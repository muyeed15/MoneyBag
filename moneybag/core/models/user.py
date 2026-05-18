from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models


class UserManager(BaseUserManager):
    # How user objects are created

    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError("Phone number is required")
        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self.db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_stuff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(phone, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    # AbstractBaseUser: gives password hashing and session support
    # PermissionMixin: gives is_superuser, groups, and permissions

    phone = models.CharField(max_length=15, unique=True)
    full_name = models.CharField(max_length=100)
    nid = models.CharField(max_lenght=20, unique=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateField(auto_now_add=True)

    # User Name
    USERNAME_FIELD = "phone"
    # Required Field
    REQUIRED_FIELDS = ["full_name", "nid"]

    objects = UserManager()

    def __str__(self):
        return self.phone
