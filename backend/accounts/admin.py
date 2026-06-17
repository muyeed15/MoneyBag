from django.contrib import admin

from accounts.models import Foundation, User, Wallet


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("phone", "full_name", "role", "is_verified", "is_active", "created_at")
    list_filter = ("role", "is_verified", "is_active")
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


@admin.register(Foundation)
class FoundationAdmin(admin.ModelAdmin):
    list_display = ("organization_name", "cause", "is_verified", "user")
    list_filter = ("cause", "is_verified")
    search_fields = ("organization_name", "registration_number")
