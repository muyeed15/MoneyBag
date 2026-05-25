from django.contrib import admin

from .models import Card, Merchant, Notification, Transaction, User, Wallet


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("phone", "full_name", "is_verified", "is_active", "created_at")
    list_filter = ("is_verified", "is_active")
    search_fields = ("phone", "full_name", "nid")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ("user", "balance", "daily_limit", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("user__phone", "user__full_name")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
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


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "message", "is_read", "created_at")
    list_filter = ("is_read",)
    search_fields = ("user__phone", "message")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


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


@admin.register(Merchant)
class MerchantAdmin(admin.ModelAdmin):
    list_display = ("business_name", "user", "category", "is_verified", "created_at")
    list_filter = ("category", "is_verified")
    search_fields = ("business_name", "user__phone")
    readonly_fields = ("created_at",)
    ordering = ("business_name",)
