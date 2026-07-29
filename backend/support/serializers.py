from rest_framework import serializers

from .models import SupportTicket, TicketMessage


class TicketMessageSerializer(serializers.ModelSerializer):
    sender_phone = serializers.CharField(source="sender.phone", read_only=True)

    class Meta:
        model = TicketMessage
        fields = ["id", "sender", "sender_phone", "message", "is_staff_reply", "created_at"]


class SupportTicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    user_phone = serializers.CharField(source="user.phone", read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            "id", "user_phone", "subject", "category",
            "status", "messages", "created_at", "updated_at",
        ]
        read_only_fields = ["status", "created_at", "updated_at"]


class CreateTicketSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=200)
    category = serializers.CharField(max_length=30, default="general")
    message = serializers.CharField()


class TicketReplySerializer(serializers.Serializer):
    message = serializers.CharField()
