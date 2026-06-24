from django.test import TestCase

from accounts.models import Wallet
from common.tests.helpers import make_user


class WalletAutoCreateSignalTest(TestCase):
    def test_wallet_created_on_user_creation(self):
        user = make_user("01700000001", "1111111111")
        self.assertTrue(Wallet.objects.filter(user=user).exists())

    def test_wallet_has_default_balance(self):
        user = make_user("01700000002", "2222222222")
        wallet = Wallet.objects.get(user=user)
        self.assertEqual(wallet.balance, 0)

    def test_wallet_defaults_to_active(self):
        user = make_user("01700000003", "3333333333")
        wallet = Wallet.objects.get(user=user)
        self.assertEqual(wallet.status, "active")
