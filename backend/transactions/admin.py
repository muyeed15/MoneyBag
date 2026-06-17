from django.contrib import admin

from transactions.models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        "reference_id",
        "sender",
        "receiver",
        "merchant",
        "amount",
        "fee",
        "transaction_type",
        "status",
        "created_at",
    )
    list_filter = ("transaction_type", "status")
    search_fields = (
        "reference_id",
        "sender__phone",
        "receiver__phone",
        "merchant__business_name",
    )
    readonly_fields = ("reference_id", "created_at")
    ordering = ("-created_at",)
