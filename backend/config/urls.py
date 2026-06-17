from django.contrib import admin
from django.shortcuts import redirect
from django.urls import include, path
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
]
