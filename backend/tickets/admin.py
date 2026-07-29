from django.contrib import admin

from .models import TicketProvider, TicketBooking


@admin.register(TicketProvider)
class TicketProviderAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "is_active"]
    list_filter = ["category", "is_active"]


@admin.register(TicketBooking)
class TicketBookingAdmin(admin.ModelAdmin):
    list_display = ["booking_reference", "user", "provider", "origin", "destination", "amount", "status", "created_at"]
    list_filter = ["status", "provider"]
    search_fields = ["booking_reference", "user__phone"]
    ordering = ["-created_at"]
