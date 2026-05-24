from django.core.management.base import BaseCommand
from core.moneybag.models import User, Wallet, Transaction, Notification
from faker import Faker
from decimal import Decimal
import random

fake = Faker()

BD_NAMES = [
    "Rahim Uddin",
    "Karim Mia",
    "Sumaiya Akter",
    "Nasrin Begum",
    "Rafiq Islam",
    "Jahanara Khatun",
    "Mizanur Rahman",
    "Shahida Parvin",
    "Abul Hossain",
    "Fatema Begum",
    "Nurul Islam",
    "Roksana Akter",
    "Shahidul Alam",
    "Mosammat Rina",
    "Belal Hossain",
    "Sharmin Sultana",
    "Aminul Islam",
    "Halima Khatun",
    "Monir Hossain",
    "Taslima Begum",
    "Sabbir Ahmed",
    "Nusrat Jahan",
    "Delwar Hossain",
    "Moriam Akter",
    "Mahbubur Rahman",
    "Sadia Islam",
    "Zahirul Haque",
    "Champa Begum",
    "Rezaul Karim",
    "Kohinoor Begum",
    "Imtiaz Ahmed",
    "Shirina Akter",
    "Golam Mostafa",
    "Salma Khatun",
    "Abul Kalam",
    "Nargis Sultana",
    "Harunur Rashid",
    "Parveen Akter",
    "Sirajul Islam",
    "Lutfun Nahar",
    "Tanvir Hossain",
    "Shamsun Nahar",
    "Enamul Haque",
    "Rubina Akter",
    "Monirul Islam",
    "Ferdousi Begum",
    "Amirul Islam",
    "Hasina Akter",
    "Babar Ali",
    "Josna Akter",
]


class Command(BaseCommand):
    help = "Seed the database with Bangladeshi fake data"

    USER_COUNT = 20
    TRANSACTION_COUNT = 60
    NOTIFICATION_COUNT = 40

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Clearing old data..."))
        self._clear()

        self.stdout.write("Seeding users...")
        users = self._seed_users()

        self.stdout.write("Seeding transactions...")
        self._seed_transactions(users)

        self.stdout.write("Seeding notifications...")
        self._seed_notifications(users)

        self.stdout.write(self.style.SUCCESS("Seeding complete."))

    # ── Clear ─────────────────────────────────────────────────────────────

    def _clear(self):
        Notification.objects.all().delete()
        Transaction.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

    # ── Users ─────────────────────────────────────────────────────────────

    def _seed_users(self):
        users = []
        names = random.sample(BD_NAMES, min(self.USER_COUNT, len(BD_NAMES)))

        for name in names:
            user = User.objects.create_user(
                phone=self._unique_phone(),
                password="password123",
                full_name=name,
                nid=self._unique_nid(),
            )
            user.is_verified = random.choices([True, False], weights=[75, 25])[0]
            user.save()

            user.wallet.balance = Decimal(random.randint(200, 80000))
            user.wallet.status = random.choices(["active", "frozen"], weights=[80, 20])[
                0
            ]
            user.wallet.save()

            users.append(user)
            self.stdout.write(f"  + {name} ({user.phone})")

        return users

    # ── Transactions ──────────────────────────────────────────────────────

    def _seed_transactions(self, users):
        types = ["send", "receive", "cash_in", "cash_out", "payment"]

        for _ in range(self.TRANSACTION_COUNT):
            tx_type = random.choice(types)
            amount = Decimal(random.randint(50, 15000))
            fee = (amount * Decimal("0.015")).quantize(Decimal("0.01"))
            sender, receiver = self._pick_parties(users, tx_type)

            Transaction.objects.create(
                sender=sender,
                receiver=receiver,
                amount=amount,
                fee=fee,
                type=tx_type,
                status=random.choices(
                    ["completed", "pending", "failed", "reversed"],
                    weights=[70, 15, 10, 5],
                )[0],
                note=self._bd_note(tx_type),
            )

    # ── Notifications ─────────────────────────────────────────────────────

    def _seed_notifications(self, users):
        templates = [
            "You sent {amount} BDT successfully.",
            "You received {amount} BDT.",
            "Cash in of {amount} BDT completed.",
            "Cash out of {amount} BDT completed.",
            "Your transaction of {amount} BDT failed.",
            "QR payment of {amount} BDT was successful.",
            "Your account has been verified.",
            "A new login was detected on your account.",
            "Your daily limit has been reset.",
            "Welcome to MoneyBag!",
        ]

        for _ in range(self.NOTIFICATION_COUNT):
            Notification.objects.create(
                user=random.choice(users),
                message=random.choice(templates).format(
                    amount=random.randint(50, 10000)
                ),
                is_read=random.choices([True, False], weights=[40, 60])[0],
            )

    # ── Helpers ───────────────────────────────────────────────────────────

    def _unique_phone(self):
        prefixes = ["01711", "01811", "01911", "01611", "01511", "01311", "01411"]
        while True:
            phone = random.choice(prefixes) + str(random.randint(100000, 999999))
            if not User.objects.filter(phone=phone).exists():
                return phone

    def _unique_nid(self):
        while True:
            nid = str(random.randint(1000000000, 9999999999))
            if not User.objects.filter(nid=nid).exists():
                return nid

    def _pick_parties(self, users, tx_type):
        if tx_type == "cash_in":
            return None, random.choice(users)
        if tx_type == "cash_out":
            return random.choice(users), None
        two = random.sample(users, 2)
        return two[0], two[1]

    def _bd_note(self, tx_type):
        notes = {
            "send": [
                "House rent",
                "Grocery bill",
                "Tuition fee",
                "Medicine cost",
                "Transport bill",
            ],
            "receive": [
                "Salary received",
                "Freelance payment",
                "Family support",
                "Business income",
            ],
            "cash_in": ["Agent cash in", "Bank deposit", "Salary cash in"],
            "cash_out": ["ATM withdrawal", "Agent cash out", "Emergency withdrawal"],
            "payment": [
                "Shop payment",
                "Restaurant bill",
                "Rickshaw fare",
                "Utility bill",
            ],
        }
        return random.choice(notes.get(tx_type, ["MoneyBag transaction"]))
