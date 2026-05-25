from django.contrib import admin
from unfold.admin import ModelAdmin

from moneybag.models import Notification


@admin.register(Notification)
class NotificationAdmin(ModelAdmin):
    list_display = ("user", "message", "is_read", "created_at")
    list_filter = ("is_read",)
    search_fields = ("user__phone", "message")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)
