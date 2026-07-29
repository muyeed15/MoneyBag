from django.urls import path

from banking.views import (
    BankListView, BankAccountListCreateView, BankAccountDeleteView,
    AddMoneyView, WithdrawView, BankTransactionHistoryView,
)

urlpatterns = [
    path("banks/", BankListView.as_view(), name="bank-list"),
    path("bank-accounts/", BankAccountListCreateView.as_view(), name="bank-account-list-create"),
    path("bank-accounts/<int:pk>/", BankAccountDeleteView.as_view(), name="bank-account-delete"),
    path("add-money/", AddMoneyView.as_view(), name="add-money"),
    path("withdraw/", WithdrawView.as_view(), name="withdraw"),
    path("bank-transactions/", BankTransactionHistoryView.as_view(), name="bank-tx-history"),
]
