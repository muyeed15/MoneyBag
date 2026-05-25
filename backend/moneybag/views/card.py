from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from moneybag.models import Card, Notification
from moneybag.pagination import get_page, get_page_size, paginate
from moneybag.serializers import CardSerializer


class CardListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = (
            Card.objects.filter(user=request.user)
            .only(
                "id",
                "last_four",
                "card_type",
                "expiry_month",
                "expiry_year",
                "status",
                "created_at",
            )
            .order_by("-created_at")
        )
        p = paginate(qs, get_page(request), get_page_size(request))
        return Response(
            {
                "count": p["count"],
                "total_pages": p["total_pages"],
                "page": p["page"],
                "results": CardSerializer(p["queryset"], many=True).data,
            }
        )

    def post(self, request):
        serializer = CardSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        card = serializer.save(user=request.user)
        return Response(CardSerializer(card).data, status=status.HTTP_201_CREATED)


class CardBlockView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            card = Card.objects.get(pk=pk, user=request.user)
        except Card.DoesNotExist:
            return Response(
                {"detail": "Card not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if card.status == "blocked":
            return Response(
                {"detail": "Card is already blocked."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        card.status = "blocked"
        card.save(update_fields=["status"])

        Notification.objects.create(
            user=request.user,
            message=f"Your card ending in {card.last_four} has been blocked.",
        )

        return Response(CardSerializer(card).data)


class CardUnblockView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            card = Card.objects.get(pk=pk, user=request.user)
        except Card.DoesNotExist:
            return Response(
                {"detail": "Card not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if card.status != "blocked":
            return Response(
                {"detail": "Card is not blocked."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        card.status = "active"
        card.save(update_fields=["status"])

        Notification.objects.create(
            user=request.user,
            message=f"Your card ending in {card.last_four} has been unblocked.",
        )

        return Response(CardSerializer(card).data)
