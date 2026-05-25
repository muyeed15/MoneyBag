from django.urls import path

from moneybag import views

urlpatterns = [
    path("me/", views.MeView.as_view(), name="me"),
    path("wallet/", views.WalletDetailView.as_view(), name="wallet-detail"),
    path("transfer/", views.TransferView.as_view(), name="transfer"),
    path("merchants/", views.MerchantListView.as_view(), name="merchant-list"),
    path("pay/merchant/", views.MerchantPayView.as_view(), name="merchant-pay"),
    path("cards/", views.CardListCreateView.as_view(), name="card-list-create"),
    path("cards/<int:pk>/block/", views.CardBlockView.as_view(), name="card-block"),
    path(
        "cards/<int:pk>/unblock/", views.CardUnblockView.as_view(), name="card-unblock"
    ),
    path("transactions/", views.TransactionListView.as_view(), name="transaction-list"),
    path(
        "transactions/<int:pk>/",
        views.TransactionDetailView.as_view(),
        name="transaction-detail",
    ),
    path(
        "notifications/stream/",
        views.NotificationStreamView.as_view(),
        name="notification-stream",
    ),
    path(
        "notifications/", views.NotificationListView.as_view(), name="notification-list"
    ),
    path(
        "notifications/read-all/",
        views.NotificationMarkAllReadView.as_view(),
        name="notification-read-all",
    ),
    path(
        "notifications/<int:pk>/",
        views.NotificationDetailView.as_view(),
        name="notification-detail",
    ),
]
