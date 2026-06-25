from decimal import Decimal

from django.db.models import Sum
from rest_framework import status
from rest_framework.response import Response

from accounts.models import Wallet
from transactions.models import Transaction


def daily_spent(user, today):
    return Transaction.objects.filter(
        sender=user,
        transaction_type__in=["send", "payment"],
        status="completed",
        created_at__date=today,
    ).aggregate(total=Sum("amount"))["total"] or Decimal("0")


def locked_deduct_wallet(user, amount):
    wallet = Wallet.objects.select_for_update().get(user=user)
    if wallet.status != "active":
        return None
    if wallet.balance < amount:
        return None
    wallet.balance -= amount
    wallet.save(update_fields=["balance"])
    return wallet


def credit_wallet(user, amount):
    wallet = Wallet.objects.select_for_update().get(user=user)
    wallet.balance += amount
    wallet.save(update_fields=["balance"])
    return wallet


def user_objects_or_error(model_class, **kwargs):
    try:
        return model_class.objects.get(**kwargs)
    except model_class.DoesNotExist:
        return None


def error_response(message, http_status=status.HTTP_400_BAD_REQUEST):
    return Response({"detail": message}, status=http_status)


def list_objects(model_class, user, serializer_class):
    objects = model_class.objects.filter(user=user)
    serializer = serializer_class(objects, many=True)
    return Response(serializer.data)
