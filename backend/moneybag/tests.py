from decimal import Decimal

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from moneybag.models import Notification, Transaction, User, Wallet

# ── Helpers ───────────────────────────────────────────────────────────────────


def make_user(phone, nid, full_name="Test User", password="testpass123"):
    return User.objects.create_user(
        phone=phone, password=password, full_name=full_name, nid=nid
    )


def make_wallet(user, balance="5000.00"):
    return Wallet.objects.create(user=user, balance=Decimal(balance))


# ── Model tests ───────────────────────────────────────────────────────────────


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


class NotificationModelTest(TestCase):
    def test_str(self):
        user = make_user("01700000001", "1111111111")
        n = Notification.objects.create(user=user, message="Test notification")
        self.assertIn("01700000001", str(n))


# ── Transfer view tests ───────────────────────────────────────────────────────


class TransferViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.sender = make_user("01700000001", "1111111111", full_name="Sender")
        self.receiver = make_user("01700000002", "2222222222", full_name="Receiver")
        self.sender_wallet = make_wallet(self.sender, "5000.00")
        self.receiver_wallet = make_wallet(self.receiver, "0.00")
        self.client.force_authenticate(user=self.sender)

    def test_successful_transfer(self):
        res = self.client.post(
            "/api/transfer/", {"receiver_phone": "01700000002", "amount": "100.00"}
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.receiver_wallet.refresh_from_db()
        self.assertEqual(self.receiver_wallet.balance, Decimal("100.00"))

    def test_sender_balance_reduced_by_amount_plus_fee(self):
        self.client.post(
            "/api/transfer/", {"receiver_phone": "01700000002", "amount": "100.00"}
        )
        self.sender_wallet.refresh_from_db()
        # fee = 100 * 1.5% = 1.50 → debit = 101.50
        self.assertEqual(self.sender_wallet.balance, Decimal("4898.50"))

    def test_self_transfer_rejected(self):
        res = self.client.post(
            "/api/transfer/", {"receiver_phone": "01700000001", "amount": "100.00"}
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_insufficient_balance_rejected(self):
        res = self.client.post(
            "/api/transfer/", {"receiver_phone": "01700000002", "amount": "99999.00"}
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unknown_receiver_rejected(self):
        res = self.client.post(
            "/api/transfer/", {"receiver_phone": "01999999999", "amount": "100.00"}
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_zero_amount_rejected(self):
        res = self.client.post(
            "/api/transfer/", {"receiver_phone": "01700000002", "amount": "0.00"}
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_request_rejected(self):
        self.client.force_authenticate(user=None)
        res = self.client.post(
            "/api/transfer/", {"receiver_phone": "01700000002", "amount": "100.00"}
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_frozen_sender_wallet_rejected(self):
        self.sender_wallet.status = "frozen"
        self.sender_wallet.save()
        res = self.client.post(
            "/api/transfer/", {"receiver_phone": "01700000002", "amount": "100.00"}
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_notifications_created_on_transfer(self):
        self.client.post(
            "/api/transfer/", {"receiver_phone": "01700000002", "amount": "100.00"}
        )
        self.assertEqual(Notification.objects.filter(user=self.sender).count(), 1)
        self.assertEqual(Notification.objects.filter(user=self.receiver).count(), 1)

    def test_transaction_record_created(self):
        self.client.post(
            "/api/transfer/", {"receiver_phone": "01700000002", "amount": "100.00"}
        )
        self.assertEqual(Transaction.objects.count(), 1)
        tx = Transaction.objects.first()
        self.assertEqual(tx.type, "send")
        self.assertEqual(tx.status, "completed")
