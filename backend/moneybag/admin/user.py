from django.contrib import admin
from unfold.admin import ModelAdmin

from moneybag.models import User


@admin.register(User)
class UserAdmin(ModelAdmin):
    list_display = ("phone", "full_name", "is_verified", "is_active", "created_at")
    list_filter = ("is_verified", "is_active")
    search_fields = ("phone", "full_name", "nid")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)
