from django.contrib import admin
from unfold.admin import ModelAdmin

from moneybag.models import Merchant


@admin.register(Merchant)
class MerchantAdmin(ModelAdmin):
    list_display = ("business_name", "user", "category", "is_verified", "created_at")
    list_filter = ("category", "is_verified")
    search_fields = ("business_name", "user__phone")
    readonly_fields = ("created_at",)
    ordering = ("business_name",)
