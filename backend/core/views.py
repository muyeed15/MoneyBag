from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from core.models import Transaction, Notification
from core.serializers import (
    UserSerializer,
    WalletSerializer,
    TransactionSerializer,
    NotificationSerializer,
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
