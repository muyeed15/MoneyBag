from rest_framework import serializers

from moneybag.models import User


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
