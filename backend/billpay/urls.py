from django.urls import path

from billpay.views import BillerListView, PayBillView, BillHistoryView

urlpatterns = [
    path("billers/", BillerListView.as_view(), name="biller-list"),
    path("pay-bill/", PayBillView.as_view(), name="pay-bill"),
    path("bills/", BillHistoryView.as_view(), name="bill-history"),
]
