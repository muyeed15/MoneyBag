from django.urls import path

from accounts.views import (
    FoundationDetailView,
    FoundationListView,
    MeView,
    QRCodeView,
    WalletDetailView,
)

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("wallet/", WalletDetailView.as_view(), name="wallet-detail"),
    path("qr/", QRCodeView.as_view(), name="qr-code"),
    path("foundations/", FoundationListView.as_view(), name="foundation-list"),
    path("foundations/<int:pk>/", FoundationDetailView.as_view(), name="foundation-detail"),
]
