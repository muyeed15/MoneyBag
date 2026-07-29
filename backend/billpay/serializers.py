from rest_framework import serializers

from .models import Biller, BillPayment


class BillerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Biller
        fields = [
            "id", "name", "category", "biller_code", "logo",
            "account_no_label", "amount_no_label", "is_active",
        ]


class PayBillSerializer(serializers.Serializer):
    biller_id = serializers.IntegerField()
    account_number = serializers.CharField(max_length=50)
    bill_number = serializers.CharField(max_length=50, required=False, allow_blank=True, default="")
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    bill_month = serializers.CharField(max_length=10, required=False, allow_blank=True, default="")

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value


class BillPaymentSerializer(serializers.ModelSerializer):
    biller_name = serializers.CharField(source="biller.name", read_only=True)
    biller_category = serializers.CharField(source="biller.category", read_only=True)

    class Meta:
        model = BillPayment
        fields = [
            "id", "biller", "biller_name", "biller_category",
            "account_number", "bill_number", "amount", "fee",
            "bill_month", "reference", "status", "created_at",
        ]
        read_only_fields = ["reference", "status", "created_at"]
