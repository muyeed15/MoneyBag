from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from moneybag.models import Merchant, Notification, Transaction, Wallet
from moneybag.serializers import (
    MerchantPaySerializer,
    MerchantSerializer,
    TransactionSerializer,
)
from moneybag.views.transaction import _daily_spent


class MerchantListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        merchants = (
            Merchant.verified.select_related("user")
            .only("id", "business_name", "category", "is_verified", "user__phone")
            .order_by("business_name")
        )
        return Response(MerchantSerializer(merchants, many=True).data)


class MerchantPayView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MerchantPaySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        merchant_id = serializer.validated_data["merchant_id"]
        amount = serializer.validated_data["amount"]
        note = serializer.validated_data["note"]

        try:
            merchant = Merchant.objects.select_related("user").get(
                pk=merchant_id, is_verified=True
            )
        except Merchant.DoesNotExist:
            return Response(
                {"detail": "Merchant not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if merchant.user == request.user:
            return Response(
                {"detail": "Cannot pay your own merchant account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        fee_rate = Decimal(str(settings.TRANSFER_FEE_PERCENT / 100))
        fee = (amount * fee_rate).quantize(Decimal("0.01"))
        total_debit = amount + fee

        try:
            with transaction.atomic():
                sender_wallet = Wallet.objects.select_for_update().get(
                    user=request.user
                )
                merchant_wallet = Wallet.objects.select_for_update().get(
                    user=merchant.user
                )

                if sender_wallet.status != "active":
                    raise ValueError("Your wallet is frozen.")
                if merchant_wallet.status != "active":
                    raise ValueError("Merchant wallet is unavailable.")
                if sender_wallet.balance < total_debit:
                    raise ValueError(
                        f"Insufficient balance. Required: ৳{total_debit} "
                        f"(৳{amount} + ৳{fee} fee)."
                    )

                today = timezone.now().date()
                spent_today = _daily_spent(request.user, today)
                if spent_today + amount > sender_wallet.daily_limit:
                    remaining = sender_wallet.daily_limit - spent_today
                    raise ValueError(
                        f"Daily limit exceeded. Remaining today: ৳{remaining}."
                    )

                sender_wallet.balance -= total_debit
                merchant_wallet.balance += amount
                sender_wallet.save(update_fields=["balance"])
                merchant_wallet.save(update_fields=["balance"])

                tx = Transaction.objects.create(
                    sender=request.user,
                    receiver=merchant.user,
                    merchant=merchant,
                    amount=amount,
                    fee=fee,
                    type="payment",
                    status="completed",
                    note=note or f"Payment to {merchant.business_name}",
                )

                Notification.objects.bulk_create(
                    [
                        Notification(
                            user=request.user,
                            message=(
                                f"You paid ৳{amount} to {merchant.business_name}. "
                                f"Fee: ৳{fee}. Ref: {tx.reference_id}"
                            ),
                        ),
                        Notification(
                            user=merchant.user,
                            message=(
                                f"Payment of ৳{amount} received from {request.user.phone} "
                                f"at {merchant.business_name}. Ref: {tx.reference_id}"
                            ),
                        ),
                    ]
                )

        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(TransactionSerializer(tx).data, status=status.HTTP_201_CREATED)
