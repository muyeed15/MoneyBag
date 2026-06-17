from django.urls import path

from transactions.views import (
    TransactionDetailView,
    TransactionListView,
    TransferView,
)

urlpatterns = [
    path("transfer/", TransferView.as_view(), name="transfer"),
    path("transactions/", TransactionListView.as_view(), name="transaction-list"),
    path(
        "transactions/<int:pk>/",
        TransactionDetailView.as_view(),
        name="transaction-detail",
    ),
]
