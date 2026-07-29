from rest_framework import serializers

from .models import PaymentGateway, GatewayTransaction


class PaymentGatewaySerializer(serializers.ModelSerializer):
    merchant_name = serializers.CharField(source="merchant.business_name", read_only=True)

    class Meta:
        model = PaymentGateway
        fields = [
            "id", "merchant", "merchant_name", "api_key",
            "webhook_url", "callback_url", "is_active", "created_at",
        ]
        read_only_fields = ["api_key", "created_at"]


class GatewayTransactionSerializer(serializers.ModelSerializer):
    merchant_name = serializers.CharField(
        source="gateway.merchant.business_name", read_only=True
    )

    class Meta:
        model = GatewayTransaction
        fields = [
            "id", "txn_id", "gateway", "merchant_name",
            "amount", "fee", "order_id", "status", "created_at",
        ]
        read_only_fields = ["txn_id", "status", "created_at"]
