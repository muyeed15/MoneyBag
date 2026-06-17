from django.urls import path

from cards.views import CardBlockView, CardListCreateView, CardUnblockView

urlpatterns = [
    path("cards/", CardListCreateView.as_view(), name="card-list-create"),
    path("cards/<int:pk>/block/", CardBlockView.as_view(), name="card-block"),
    path("cards/<int:pk>/unblock/", CardUnblockView.as_view(), name="card-unblock"),
]
