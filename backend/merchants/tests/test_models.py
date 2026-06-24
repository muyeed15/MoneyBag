from django.test import TestCase

from common.tests.helpers import make_user
from merchants.models import Merchant


class MerchantModelTest(TestCase):
    def setUp(self):
        self.user = make_user("01700000001", "1111111111")
        self.merchant = Merchant.objects.create(
            user=self.user,
            business_name="Test Store",
            category="retail",
        )

    def test_str(self):
        self.assertEqual(str(self.merchant), "Test Store (Retail)")

    def test_default_is_not_verified(self):
        self.assertFalse(self.merchant.is_verified)

    def test_default_category(self):
        merchant = Merchant.objects.create(
            user=make_user("01700000002", "2222222222"),
            business_name="Other Store",
        )
        self.assertEqual(merchant.category, "other")

    def test_verified_manager(self):
        Merchant.objects.create(
            user=make_user("01700000003", "3333333333"),
            business_name="Verified Shop",
            is_verified=True,
        )
        self.assertEqual(Merchant.verified.count(), 1)
        self.assertEqual(Merchant.objects.count(), 2)

    def test_user_relation(self):
        self.assertEqual(self.merchant.user, self.user)

    def test_ordering(self):
        Merchant.objects.create(
            user=make_user("01700000002", "2222222222"),
            business_name="A Store",
        )
        qs = Merchant.objects.all()
        self.assertEqual(qs.first().business_name, "A Store")

    def test_all_categories_valid(self):
        for i, (cat_key, _) in enumerate(Merchant.CATEGORY_CHOICES):
            phone = f"0170000{100 + i:0>4}"
            nid = str(1000000000 + i)
            m = Merchant.objects.create(
                user=make_user(phone, nid),
                business_name=f"Shop {cat_key}",
                category=cat_key,
            )
            self.assertEqual(m.category, cat_key)

    def test_verified_manager_excludes_unverified(self):
        Merchant.objects.create(
            user=make_user("0170000099", "9999999999"),
            business_name="Not Verified",
        )
        self.assertEqual(Merchant.verified.count(), 0)

    def test_merchant_without_category_defaults_other(self):
        m = Merchant.objects.create(
            user=make_user("0170000098", "8888888888"),
            business_name="No Category",
        )
        self.assertEqual(m.category, "other")
