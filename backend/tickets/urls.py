from django.urls import path

from tickets.views import (
    TicketCategoryListView, TicketProviderListView, TicketTripsView,
    BookTicketView, TicketHistoryView, CancelTicketView,
)

urlpatterns = [
    path("ticket-categories/", TicketCategoryListView.as_view(), name="ticket-categories"),
    path("ticket-providers/", TicketProviderListView.as_view(), name="ticket-provider-list"),
    path("ticket-trips/", TicketTripsView.as_view(), name="ticket-trips"),
    path("book-ticket/", BookTicketView.as_view(), name="book-ticket"),
    path("tickets/", TicketHistoryView.as_view(), name="ticket-history"),
    path("tickets/<int:pk>/cancel/", CancelTicketView.as_view(), name="cancel-ticket"),
]
