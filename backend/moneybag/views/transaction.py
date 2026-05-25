from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from moneybag.models import Notification, Transaction, Wallet
from moneybag.serializers import TransactionSerializer, TransferSerializer


def _transaction_qs(user):
    return (
        Transaction.objects.filter(Q(sender=user) | Q(receiver=user))
        .select_related("sender", "receiver", "merchant")
        .only(
            "id",
            "reference_id",
            "sender__phone",
            "receiver__phone",
            "merchant__business_name",
            "amount",
            "fee",
            "type",
            "status",
            "note",
            "created_at",
        )
        .order_by("-created_at")
    )


def _daily_spent(user, today):
    return Transaction.objects.filter(
        sender=user,
        type__in=["send", "payment"],
        status="completed",
        created_at__date=today,
    ).aggregate(total=Sum("amount"))["total"] or Decimal("0")


class TransactionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = _transaction_qs(request.user)[:100]
        return Response(TransactionSerializer(transactions, many=True).data)


class TransactionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            tx = _transaction_qs(request.user).get(pk=pk)
        except Transaction.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(TransactionSerializer(tx).data)


class TransferView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TransferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        receiver_phone = serializer.validated_data["receiver_phone"]
        amount = serializer.validated_data["amount"]
        note = serializer.validated_data["note"]

        if receiver_phone == request.user.phone:
            return Response(
                {"detail": "Cannot transfer to yourself."},
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

                try:
                    receiver_wallet = (
                        Wallet.objects.select_for_update()
                        .select_related("user")
                        .get(user__phone=receiver_phone)
                    )
                except Wallet.DoesNotExist:
                    return Response(
                        {"detail": "Recipient account not found."},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                if sender_wallet.status != "active":
                    raise ValueError("Your wallet is frozen.")
                if receiver_wallet.status != "active":
                    raise ValueError("Receiver's wallet is frozen.")
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
                receiver_wallet.balance += amount
                sender_wallet.save(update_fields=["balance"])
                receiver_wallet.save(update_fields=["balance"])

                tx = Transaction.objects.create(
                    sender=request.user,
                    receiver=receiver_wallet.user,
                    amount=amount,
                    fee=fee,
                    type="send",
                    status="completed",
                    note=note,
                )

                Notification.objects.bulk_create(
                    [
                        Notification(
                            user=request.user,
                            message=(
                                f"You sent ৳{amount} to {receiver_phone}. "
                                f"Fee: ৳{fee}. Ref: {tx.reference_id}"
                            ),
                        ),
                        Notification(
                            user=receiver_wallet.user,
                            message=(
                                f"You received ৳{amount} from {request.user.phone}. "
                                f"Ref: {tx.reference_id}"
                            ),
                        ),
                    ]
                )

        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(TransactionSerializer(tx).data, status=status.HTTP_201_CREATED)
