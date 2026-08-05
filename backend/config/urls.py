from django.conf import settings
from django.contrib import admin
from django.shortcuts import redirect
from django.urls import include, path
from django.views.static import serve as media_serve
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("", lambda r: redirect("admin:index")),
    path("admin/", admin.site.urls),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/", include("accounts.urls")),
    path("api/", include("cards.urls")),
    path("api/", include("transactions.urls")),
    path("api/", include("merchants.urls")),
    path("api/", include("notifications.urls")),
    path("api/", include("savings.urls")),
    path("api/", include("charity.urls")),
    path("api/", include("recharge.urls")),
    path("api/", include("billpay.urls")),
    path("api/", include("agents.urls")),
    path("api/", include("banking.urls")),
    path("api/", include("loans.urls")),
    path("api/", include("remittance.urls")),
    path("api/", include("rewards.urls")),
    path("api/", include("gateway.urls")),
    path("api/", include("tickets.urls")),
    path("api/", include("support.urls")),
    path("api/", include("statements.urls")),
    path("media/<path:path>", media_serve, {"document_root": settings.MEDIA_ROOT}),
]
