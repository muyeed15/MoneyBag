from django.utils import timezone
from rest_framework import serializers

from moneybag.models import Card


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
        if value < timezone.now().year:
            raise serializers.ValidationError("Card is already expired.")
        return value
