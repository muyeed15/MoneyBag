from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from moneybag.models import Wallet
from moneybag.serializers import WalletSerializer


class WalletDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wallet = Wallet.objects.select_related("user").get(user=request.user)
        return Response(WalletSerializer(wallet).data)
