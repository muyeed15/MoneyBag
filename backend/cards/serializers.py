from django.utils import timezone
from rest_framework import serializers

from cards.models import Card


CARD_NETWORKS = {"visa": "4", "mastercard": "5", "amex": "3", "nexus": "6"}


class CardSerializer(serializers.ModelSerializer):
    card_number = serializers.CharField(write_only=True, max_length=19)
    cardholder_name = serializers.CharField(max_length=100)
    card_network = serializers.ChoiceField(choices=Card.CARD_NETWORK_CHOICES)

    class Meta:
        model = Card
        fields = [
            "id", "last_four", "masked_number", "cardholder_name",
            "card_network", "card_type", "card_number",
            "expiry_month", "expiry_year", "status", "created_at",
        ]
        read_only_fields = ["last_four", "masked_number", "status", "created_at"]

    def validate_card_number(self, value):
        digits = value.replace(" ", "")
        if not digits.isdigit():
            raise serializers.ValidationError("Card number must contain only digits.")
        if len(digits) < 13 or len(digits) > 19:
            raise serializers.ValidationError("Invalid card number length.")
        return digits

    def validate_card_network(self, value):
        prefix = self.initial_data.get("card_number", "").replace(" ", "")[:1]
        expected = CARD_NETWORKS.get(value, "")
        if expected and prefix != expected:
            raise serializers.ValidationError(
                f"Card number does not match {value} network."
            )
        return value

    def validate_expiry_month(self, value):
        if not (1 <= value <= 12):
            raise serializers.ValidationError("Expiry month must be between 1 and 12.")
        return value

    def validate_expiry_year(self, value):
        now = timezone.now()
        month = int(self.initial_data.get("expiry_month", 1))
        if value < now.year:
            raise serializers.ValidationError("Card is already expired.")
        if value == now.year and month < now.month:
            raise serializers.ValidationError("Card is already expired.")
        return value

    def create(self, validated_data):
        raw_number = validated_data.pop("card_number")
        card = Card(**validated_data)
        card.set_number(raw_number)
        card.save()
        return card
