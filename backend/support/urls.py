from django.urls import path

from support.views import TicketListCreateView, TicketDetailView, TicketReplyView

urlpatterns = [
    path("support-tickets/", TicketListCreateView.as_view(), name="support-ticket-list-create"),
    path("support-tickets/<int:pk>/", TicketDetailView.as_view(), name="support-ticket-detail"),
    path("support-tickets/<int:pk>/reply/", TicketReplyView.as_view(), name="support-ticket-reply"),
]
