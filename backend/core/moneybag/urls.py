from django.urls import path
from core.moneybag import views

urlpatterns = [
    path("me/", views.MeView.as_view(), name="me"),
    path("wallet/", views.WalletDetailView.as_view(), name="wallet-detail"),
    path("transactions/", views.TransactionListView.as_view(), name="transaction-list"),
    path(
        "transactions/<int:pk>/",
        views.TransactionDetailView.as_view(),
        name="transaction-detail",
    ),
    path(
        "notifications/", views.NotificationListView.as_view(), name="notification-list"
    ),
    path(
        "notifications/<int:pk>/",
        views.NotificationDetailView.as_view(),
        name="notification-detail",
    ),
]
