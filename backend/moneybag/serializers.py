from rest_framework import serializers

from moneybag.models import Card, Merchant, Notification, Transaction, User, Wallet


class TransferSerializer(serializers.Serializer):
    receiver_phone = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    note = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate_receiver_phone(self, value):
        if not User.objects.filter(phone=value).exists():
            raise serializers.ValidationError(
                "No account found with this phone number."
            )
        return value


class MerchantPaySerializer(serializers.Serializer):
    merchant_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    note = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate_merchant_id(self, value):
        if not Merchant.objects.filter(id=value, is_verified=True).exists():
            raise serializers.ValidationError("Merchant not found or not verified.")
        return value


class UserSerializer(serializers.ModelSerializer):
    has_merchant_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "phone",
            "full_name",
            "nid",
            "is_verified",
            "is_active",
            "has_merchant_profile",
            "created_at",
        ]
        read_only_fields = ["is_verified", "is_active", "created_at"]

    def get_has_merchant_profile(self, obj):
        return hasattr(obj, "merchant_profile")


class WalletSerializer(serializers.ModelSerializer):
    user_phone = serializers.CharField(source="user.phone", read_only=True)

    class Meta:
        model = Wallet
        fields = ["id", "user_phone", "balance", "daily_limit", "status", "created_at"]
        read_only_fields = ["balance", "created_at"]


class TransactionSerializer(serializers.ModelSerializer):
    sender_phone = serializers.CharField(
        source="sender.phone", read_only=True, allow_null=True
    )
    receiver_phone = serializers.CharField(
        source="receiver.phone", read_only=True, allow_null=True
    )
    merchant_name = serializers.CharField(
        source="merchant.business_name", read_only=True, allow_null=True
    )

    class Meta:
        model = Transaction
        fields = [
            "id",
            "reference_id",
            "sender_phone",
            "receiver_phone",
            "merchant_name",
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


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = [
            "id",
            "last_four",
            "card_type",
            "expiry_month",
            "expiry_year",
            "status",
            "created_at",
        ]
        read_only_fields = ["status", "created_at"]

    def validate_last_four(self, value):
        if not value.isdigit() or len(value) != 4:
            raise serializers.ValidationError("last_four must be exactly 4 digits.")
        return value

    def validate_expiry_month(self, value):
        if not (1 <= value <= 12):
            raise serializers.ValidationError("Expiry month must be between 1 and 12.")
        return value

    def validate_expiry_year(self, value):
        if value < 2024:
            raise serializers.ValidationError("Card is already expired.")
        return value


class MerchantSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source="user.phone", read_only=True)

    class Meta:
        model = Merchant
        fields = ["id", "business_name", "category", "is_verified", "phone"]
        read_only_fields = ["is_verified"]
