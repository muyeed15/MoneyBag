from django.urls import path

from recharge.views import (
    OperatorListView, DataPackListView,
    RechargeView, RechargeHistoryView,
)

urlpatterns = [
    path("operators/", OperatorListView.as_view(), name="operator-list"),
    path("data-packs/", DataPackListView.as_view(), name="data-pack-list"),
    path("recharge/", RechargeView.as_view(), name="recharge"),
    path("recharges/", RechargeHistoryView.as_view(), name="recharge-history"),
]
