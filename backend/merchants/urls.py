from django.urls import path

from merchants.views import MerchantListView, MerchantPayView

urlpatterns = [
    path("merchants/", MerchantListView.as_view(), name="merchant-list"),
    path("pay/merchant/", MerchantPayView.as_view(), name="merchant-pay"),
]
