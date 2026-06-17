from rest_framework import serializers

from accounts.models import Foundation, User, Wallet


class UserSerializer(serializers.ModelSerializer):
    has_merchant_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "phone",
            "full_name",
            "nid",
            "role",
            "is_verified",
            "is_active",
            "has_merchant_profile",
            "created_at",
        ]
        read_only_fields = ["role", "is_verified", "is_active", "created_at"]

    def get_has_merchant_profile(self, obj):
        return hasattr(obj, "merchant_profile")


class WalletSerializer(serializers.ModelSerializer):
    user_phone = serializers.CharField(source="user.phone", read_only=True)

    class Meta:
        model = Wallet
        fields = ["id", "user_phone", "balance", "daily_limit", "status", "created_at"]
        read_only_fields = ["balance", "created_at"]


class FoundationSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source="user.phone", read_only=True)

    class Meta:
        model = Foundation
        fields = [
            "id", "organization_name", "cause", "description",
            "website", "contact_email", "contact_phone", "is_verified",
            "phone", "created_at",
        ]
        read_only_fields = ["is_verified", "created_at"]
