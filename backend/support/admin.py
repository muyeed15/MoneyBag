from django.contrib import admin

from .models import SupportCategory, SupportTicket, TicketMessage


@admin.register(SupportCategory)
class SupportCategoryAdmin(admin.ModelAdmin):
    list_display = ["key", "label", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["key", "label"]


class TicketMessageInline(admin.TabularInline):
    model = TicketMessage
    extra = 0
    readonly_fields = ["created_at"]


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "subject", "category", "status", "created_at"]
    list_filter = ["status", "category"]
    search_fields = ["user__phone", "subject"]
    ordering = ["-created_at"]
    inlines = [TicketMessageInline]


@admin.register(TicketMessage)
class TicketMessageAdmin(admin.ModelAdmin):
    list_display = ["ticket", "sender", "is_staff_reply", "created_at"]
    list_filter = ["is_staff_reply"]
    ordering = ["created_at"]
