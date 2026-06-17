from decimal import Decimal

from django.test import TestCase

from accounts.models import User, Wallet


def make_user(phone, nid, full_name="Test User", password="testpass123"):
    return User.objects.create_user(
        phone=phone, password=password, full_name=full_name, nid=nid
    )


def make_wallet(user, balance="5000.00"):
    wallet, _ = Wallet.objects.get_or_create(user=user)
    wallet.balance = Decimal(balance)
    wallet.save(update_fields=["balance"])
    return wallet


class UserModelTest(TestCase):
    def test_create_user(self):
        user = make_user("01700000001", "1234567890")
        self.assertEqual(str(user), "01700000001")
        self.assertTrue(user.check_password("testpass123"))
        self.assertFalse(user.is_staff)

    def test_create_superuser(self):
        user = User.objects.create_superuser(
            phone="01700000002", password="pass", full_name="Admin", nid="9999999999"
        )
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)

    def test_phone_is_required(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(
                phone="", password="pass", full_name="No Phone", nid="111"
            )


class WalletModelTest(TestCase):
    def setUp(self):
        self.user = make_user("01700000001", "1111111111")
        self.wallet = make_wallet(self.user)

    def test_str(self):
        self.assertIn("01700000001", str(self.wallet))

    def test_default_status_is_active(self):
        self.assertEqual(self.wallet.status, "active")

    def test_default_daily_limit(self):
        self.assertEqual(self.wallet.daily_limit, Decimal("10000.00"))
