from django.contrib import admin

from moneybag.models import Card


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "last_four",
        "card_type",
        "expiry_month",
        "expiry_year",
        "status",
        "created_at",
    )
    list_filter = ("card_type", "status")
    search_fields = ("user__phone", "last_four")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)
