from django.urls import path

from gateway.views import (
    GatewayInitiateView, GatewayStatusView, GatewayHistoryView, GatewayWebhookView,
)

urlpatterns = [
    path("gateway/initiate/", GatewayInitiateView.as_view(), name="gateway-initiate"),
    path("gateway/<str:txn_id>/", GatewayStatusView.as_view(), name="gateway-status"),
    path("gateway-transactions/", GatewayHistoryView.as_view(), name="gateway-history"),
    path("gateway-webhook/", GatewayWebhookView.as_view(), name="gateway-webhook"),
]
