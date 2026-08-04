from django.urls import path

from accounts.views import (
    FoundationCauseListView,
    FoundationDetailView,
    FoundationListView,
    MeView,
    PhoneLookupView,
    QRCodeView,
    WalletDetailView,
)

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("wallet/", WalletDetailView.as_view(), name="wallet-detail"),
    path("qr/", QRCodeView.as_view(), name="qr-code"),
    path("lookup/<str:phone>/", PhoneLookupView.as_view(), name="phone-lookup"),
    path("foundations/", FoundationListView.as_view(), name="foundation-list"),
    path("foundation-causes/", FoundationCauseListView.as_view(), name="foundation-causes"),
    path("foundations/<int:pk>/", FoundationDetailView.as_view(), name="foundation-detail"),
]
