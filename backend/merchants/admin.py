from django.contrib import admin

from merchants.models import Merchant, MerchantCategory


@admin.register(MerchantCategory)
class MerchantCategoryAdmin(admin.ModelAdmin):
    list_display = ("key", "label", "is_active")
    list_filter = ("is_active",)
    search_fields = ("key", "label")


@admin.register(Merchant)
class MerchantAdmin(admin.ModelAdmin):
    list_display = ("business_name", "user", "category", "is_verified", "created_at")
    list_filter = ("category", "is_verified")
    search_fields = ("business_name", "user__phone")
    readonly_fields = ("created_at",)
    ordering = ("business_name",)
