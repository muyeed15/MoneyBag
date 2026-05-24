from decimal import Decimal

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from moneybag.models import Transaction, Notification, Wallet
from moneybag.serializers import (
    UserSerializer,
    WalletSerializer,
    TransactionSerializer,
    NotificationSerializer,
    TransferSerializer,
)


class MeView(generics.RetrieveAPIView):
    """GET /api/me/ — returns the authenticated user's own profile."""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # No pk lookup needed; the user is identified by their JWT token.
        return self.request.user


class WalletDetailView(generics.RetrieveAPIView):
    """GET /api/wallet/ — returns the authenticated user's wallet balance and status."""

    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Each user has exactly one wallet via OneToOneField.
        return self.request.user.wallet


class TransactionListView(generics.ListAPIView):
    """GET /api/transactions/ — lists all transactions the authenticated user participated in."""

    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Include transactions where the user is either the sender or the receiver.
        user = self.request.user
        return Transaction.objects.filter(sender=user) | Transaction.objects.filter(
            receiver=user
        )


class TransactionDetailView(generics.RetrieveAPIView):
    """GET /api/transactions/<pk>/ — returns a single transaction the user owns."""

    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Scoping to the user's transactions ensures a foreign pk returns 404, not 403.
        user = self.request.user
        return Transaction.objects.filter(sender=user) | Transaction.objects.filter(
            receiver=user
        )


class NotificationListView(generics.ListAPIView):
    """GET /api/notifications/ — lists all notifications for the authenticated user."""

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )


class NotificationDetailView(generics.RetrieveAPIView):
    """GET /api/notifications/<pk>/ — returns a single notification the user owns."""

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Same scoping pattern as transactions — foreign pk silently returns 404.
        return Notification.objects.filter(user=self.request.user)


class TransferView(APIView):
    """POST /api/transfer/ — atomically moves funds from the authenticated user to another account."""

    permission_classes = [IsAuthenticated]
    FEE_RATE = Decimal("0.015")  # 1.5% per transfer, charged to sender

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

        fee = (amount * self.FEE_RATE).quantize(Decimal("0.01"))
        total_debit = amount + fee

        try:
            with transaction.atomic():
                # Lock both wallet rows for the duration of this transaction.
                # select_for_update() prevents another request from reading or
                # modifying these rows until this block commits or rolls back.
                sender_wallet = Wallet.objects.select_for_update().get(
                    user=request.user
                )
                receiver_wallet = Wallet.objects.select_for_update().get(
                    user__phone=receiver_phone
                )

                if sender_wallet.status != "active":
                    raise ValueError("Your wallet is frozen.")
                if receiver_wallet.status != "active":
                    raise ValueError("Receiver's wallet is frozen.")
                if sender_wallet.balance < total_debit:
                    raise ValueError(
                        f"Insufficient balance. Required: ৳{total_debit} (৳{amount} + ৳{fee} fee)."
                    )

                # Daily limit: sum of amounts already sent today (completed transfers only).
                today = timezone.now().date()
                sent_today = Transaction.objects.filter(
                    sender=request.user,
                    type="send",
                    status="completed",
                    created_at__date=today,
                ).aggregate(total=Sum("amount"))["total"] or Decimal("0")
                if sent_today + amount > sender_wallet.daily_limit:
                    remaining = sender_wallet.daily_limit - sent_today
                    raise ValueError(
                        f"Daily limit exceeded. Remaining today: ৳{remaining}."
                    )

                sender_wallet.balance -= total_debit
                receiver_wallet.balance += amount
                sender_wallet.save()
                receiver_wallet.save()

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
