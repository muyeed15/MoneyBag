from decimal import Decimal

from rest_framework import serializers

from .models import HawlTracking, Sadaqah, SadaqahJariyah, ZakatPayment


class ZakatPaymentSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source="recipient.foundation_profile.organization_name", read_only=True, allow_null=True)

    class Meta:
        model = ZakatPayment
        fields = ["id", "amount", "asset_type", "hawl_year", "recipient", "recipient_name", "paid_at"]
        read_only_fields = ["paid_at"]


class CalculateZakatSerializer(serializers.Serializer):
    total_wealth = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=Decimal("0"))
    nisab_threshold = serializers.DecimalField(max_digits=12, decimal_places=2, default=Decimal("85000"))


class PayZakatSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("1"))
    recipient_id = serializers.IntegerField(help_text="Foundation user ID receiving this zakat")
    asset_type = serializers.CharField(required=False, allow_blank=True, max_length=50)
    hawl_year = serializers.IntegerField(required=False)


class SadaqahSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source="recipient.foundation_profile.organization_name", read_only=True, allow_null=True)

    class Meta:
        model = Sadaqah
        fields = ["id", "amount", "cause", "is_anonymous", "recipient", "recipient_name", "given_at"]
        read_only_fields = ["given_at"]


class GiveSadaqahSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("1"))
    recipient_id = serializers.IntegerField(help_text="Foundation user ID receiving this sadaqah")
    cause = serializers.CharField(required=False, allow_blank=True, max_length=100)
    is_anonymous = serializers.BooleanField(default=False)


class HawlTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = HawlTracking
        fields = ["nisab_crossed_at", "next_hawl_date", "is_eligible", "updated_at"]
        read_only_fields = ["nisab_crossed_at", "next_hawl_date", "is_eligible", "updated_at"]


class UpdateHawlSerializer(serializers.Serializer):
    current_wealth = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=Decimal("0"), default=Decimal("0"))


class SadaqahJariyahSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source="recipient.foundation_profile.organization_name", read_only=True, allow_null=True)

    class Meta:
        model = SadaqahJariyah
        fields = [
            "id", "amount", "cause", "frequency", "is_active",
            "recipient", "recipient_name",
            "start_date", "next_due_date", "total_donated", "created_at",
        ]
        read_only_fields = ["total_donated", "created_at", "next_due_date"]


class CreateSadaqahJariyahSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("1"))
    recipient_id = serializers.IntegerField(help_text="Foundation user ID receiving this sadaqah jariyah")
    cause = serializers.CharField(required=False, allow_blank=True, max_length=100)
    frequency = serializers.ChoiceField(choices=["monthly"], default="monthly")
