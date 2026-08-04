from decimal import Decimal

from accounts.models import CharityCause, User, Wallet
from merchants.models import MerchantCategory


def make_user(phone, nid, full_name="Test User", password="testpass123", **kwargs):
    return User.objects.create_user(
        phone=phone, password=password, full_name=full_name, nid=nid, **kwargs
    )


def make_cause(key="education", label=None, icon="Heart"):
    return CharityCause.objects.get_or_create(
        key=key, defaults={"label": label or key.title(), "icon": icon}
    )[0]


def make_merchant_category(key="retail", label=None):
    return MerchantCategory.objects.get_or_create(
        key=key, defaults={"label": label or key.title()}
    )[0]


def make_wallet(user, balance="5000.00"):
    wallet, _ = Wallet.objects.get_or_create(user=user)
    wallet.balance = Decimal(balance)
    wallet.save(update_fields=["balance"])
    return wallet
