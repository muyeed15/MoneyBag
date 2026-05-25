from django.contrib import admin
from unfold.admin import ModelAdmin

from moneybag.models import Wallet


@admin.register(Wallet)
class WalletAdmin(ModelAdmin):
    list_display = ("user", "balance", "daily_limit", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("user__phone", "user__full_name")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)
