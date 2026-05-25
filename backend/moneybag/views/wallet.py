from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from moneybag.models import Wallet
from moneybag.serializers import WalletSerializer


class WalletDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            wallet = Wallet.objects.select_related("user").get(user=request.user)
        except Wallet.DoesNotExist:
            return Response(
                {"detail": "Wallet not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(WalletSerializer(wallet).data)
