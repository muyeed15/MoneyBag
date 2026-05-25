from django.contrib import admin
from unfold.admin import ModelAdmin

from moneybag.models import Transaction


@admin.register(Transaction)
class TransactionAdmin(ModelAdmin):
    list_display = (
        "reference_id",
        "sender",
        "receiver",
        "merchant",
        "amount",
        "fee",
        "type",
        "status",
        "created_at",
    )
    list_filter = ("type", "status")
    search_fields = (
        "reference_id",
        "sender__phone",
        "receiver__phone",
        "merchant__business_name",
    )
    readonly_fields = ("reference_id", "created_at")
    ordering = ("-created_at",)
