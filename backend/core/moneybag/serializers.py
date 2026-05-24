from rest_framework import serializers
from core.moneybag.models import User, Wallet, Transaction, Notification


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "phone",
            "full_name",
            "nid",
            "is_verified",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["is_verified", "is_active", "created_at"]


class WalletSerializer(serializers.ModelSerializer):
    user_phone = serializers.CharField(source="user.phone", read_only=True)

    class Meta:
        model = Wallet
        fields = ["id", "user_phone", "balance", "daily_limit", "status", "created_at"]
        read_only_fields = ["balance", "created_at"]


class TransactionSerializer(serializers.ModelSerializer):
    sender_phone = serializers.CharField(source="sender.phone", read_only=True)
    receiver_phone = serializers.CharField(source="receiver.phone", read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id",
            "reference_id",
            "sender_phone",
            "receiver_phone",
            "amount",
            "fee",
            "type",
            "status",
            "note",
            "created_at",
        ]
        read_only_fields = ["reference_id", "fee", "status", "created_at"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "message", "is_read", "created_at"]
        read_only_fields = ["created_at"]
