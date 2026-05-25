from rest_framework import serializers

from moneybag.models import Merchant


class MerchantSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source="user.phone", read_only=True)

    class Meta:
        model = Merchant
        fields = ["id", "business_name", "category", "is_verified", "phone"]
        read_only_fields = ["is_verified"]


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
