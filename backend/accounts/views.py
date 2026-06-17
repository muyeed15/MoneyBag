import io

import qrcode
from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Foundation, Wallet
from accounts.serializers import (
    FoundationSerializer,
    UserSerializer,
    WalletSerializer,
)
from common.utils import error_response


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class WalletDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            wallet = Wallet.objects.select_related("user").get(user=request.user)
        except Wallet.DoesNotExist:
            return error_response("Wallet not found.", 404)
        return Response(WalletSerializer(wallet).data)


class QRCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        phone = request.user.phone
        data = f"yaqeen://pay/{phone}"

        img = qrcode.make(data, box_size=10, border=2)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        return HttpResponse(
            buf.getvalue(),
            content_type="image/png",
            headers={
                "Cache-Control": "no-cache",
                "Content-Disposition": f'inline; filename="qr-{phone}.png"',
            },
        )


class FoundationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        foundations = Foundation.objects.filter(is_verified=True).select_related("user")
        serializer = FoundationSerializer(foundations, many=True)
        return Response(serializer.data)


class FoundationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            foundation = Foundation.objects.select_related("user").get(pk=pk, is_verified=True)
        except Foundation.DoesNotExist:
            return error_response("Foundation not found.", 404)
        return Response(FoundationSerializer(foundation).data)
