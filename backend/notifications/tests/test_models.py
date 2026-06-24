from django.test import TestCase

from common.tests.helpers import make_user
from notifications.models import Notification


class NotificationModelTest(TestCase):
    def setUp(self):
        self.user = make_user("01700000001", "1111111111")
        self.notification = Notification.objects.create(
            user=self.user,
            message="You received ৳100.00 from 01700000002.",
        )

    def test_str(self):
        expected = "01700000001 - You received ৳100.00 from 01700000002."
        self.assertEqual(str(self.notification), expected)

    def test_default_is_read_false(self):
        self.assertFalse(self.notification.is_read)

    def test_user_relation(self):
        self.assertEqual(self.notification.user, self.user)

    def test_long_message_truncated_in_str(self):
        long_msg = "x" * 100
        n = Notification.objects.create(user=self.user, message=long_msg)
        self.assertIn("x" * 40, str(n))

    def test_empty_message(self):
        n = Notification.objects.create(user=self.user, message="")
        self.assertIn(" - ", str(n))

    def test_notification_ordering(self):
        n2 = Notification.objects.create(user=self.user, message="Second")
        qs = Notification.objects.all()
        self.assertEqual(qs.first(), n2)
