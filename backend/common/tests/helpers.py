from decimal import Decimal

from accounts.models import User, Wallet


def make_user(phone, nid, full_name="Test User", password="testpass123", **kwargs):
    return User.objects.create_user(
        phone=phone, password=password, full_name=full_name, nid=nid, **kwargs
    )


def make_wallet(user, balance="5000.00"):
    wallet, _ = Wallet.objects.get_or_create(user=user)
    wallet.balance = Decimal(balance)
    wallet.save(update_fields=["balance"])
    return wallet
