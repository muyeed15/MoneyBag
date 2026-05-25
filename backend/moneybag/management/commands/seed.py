import random
from decimal import Decimal

from django.conf import settings
from django.core.management.base import BaseCommand

from moneybag.models import Card, Merchant, Notification, Transaction, User, Wallet

PASSWORD = "12345678"

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
]

BD_MERCHANTS = [
    ("Aarong", "retail"),
    ("Shajgoj", "retail"),
    ("Daraz Bangladesh", "retail"),
    ("Kacchi Bhai", "food"),
    ("Haji Biriyani House", "food"),
    ("Star Kabab & Restaurant", "food"),
    ("Pathao", "transport"),
    ("Shohoz Rides", "transport"),
    ("Obhai", "transport"),
    ("DESCO", "utility"),
    ("Titas Gas", "utility"),
    ("Ibn Sina Hospital", "health"),
    ("Brac University", "education"),
    ("Star Cineplex", "entertainment"),
]


class Command(BaseCommand):
    help = "Seed the database with realistic Bangladeshi fintech data"

    USER_COUNT = 25
    SEND_COUNT = 35
    PAYMENT_COUNT = 30
    CASH_IN_COUNT = 20
    CASH_OUT_COUNT = 15

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Clearing old data…"))
        self._clear()

        self.stdout.write("Seeding users…")
        users = self._seed_users()

        self.stdout.write("Seeding merchants…")
        merchants = self._seed_merchants(users)

        self.stdout.write("Seeding cards…")
        self._seed_cards(users)

        self.stdout.write("Seeding transactions…")
        self._seed_transactions(users, merchants)

        self.stdout.write("Seeding notifications…")
        self._seed_notifications(users)

        self.stdout.write(self.style.SUCCESS("\nSeeding complete."))
        self._print_summary(users, merchants)

    def _clear(self):
        Notification.objects.all().delete()
        Transaction.objects.all().delete()
        Card.objects.all().delete()
        Merchant.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

    def _seed_users(self):
        users = []
        names = random.sample(BD_NAMES, min(self.USER_COUNT, len(BD_NAMES)))
        for name in names:
            user = User.objects.create_user(
                phone=self._unique_phone(),
                password=PASSWORD,
                full_name=name,
                nid=self._unique_nid(),
                is_verified=random.choices([True, False], weights=[80, 20])[0],
            )
            user.wallet.balance = Decimal(str(random.randint(500, 50000)))
            user.wallet.status = random.choices(["active", "frozen"], weights=[90, 10])[
                0
            ]
            user.wallet.save(update_fields=["balance", "status"])
            users.append(user)
            self.stdout.write(
                f"  + {user.full_name} ({user.phone})  ৳{user.wallet.balance}"
            )
        return users

    def _seed_merchants(self, users):
        merchant_users = random.sample(users, min(len(BD_MERCHANTS), len(users)))
        merchants = []
        for user, (biz_name, category) in zip(merchant_users, BD_MERCHANTS):
            merchant = Merchant.objects.create(
                user=user,
                business_name=biz_name,
                category=category,
                is_verified=random.choices([True, False], weights=[75, 25])[0],
            )
            merchants.append(merchant)
            status_label = "✓" if merchant.is_verified else "✗"
            self.stdout.write(f"  {status_label} {biz_name} ({category})")
        return merchants

    def _seed_cards(self, users):
        card_count = 0
        for user in users:
            for _ in range(random.randint(1, 2)):
                Card.objects.create(
                    user=user,
                    last_four=str(random.randint(1000, 9999)),
                    card_type=random.choice(["debit", "prepaid"]),
                    expiry_month=random.randint(1, 12),
                    expiry_year=random.randint(2025, 2030),
                    status=random.choices(
                        ["active", "blocked", "expired"], weights=[80, 10, 10]
                    )[0],
                )
                card_count += 1
        self.stdout.write(f"  + {card_count} cards")

    def _seed_transactions(self, users, merchants):
        fee_rate = Decimal(str(settings.TRANSFER_FEE_PERCENT / 100))
        active_users = [u for u in users if u.wallet.status == "active"]
        verified_merchants = [m for m in merchants if m.is_verified]

        for _ in range(self.SEND_COUNT):
            if len(active_users) < 2:
                break
            sender, receiver = random.sample(active_users, 2)
            amount = Decimal(str(random.randint(100, 5000)))
            fee = (amount * fee_rate).quantize(Decimal("0.01"))
            total_debit = amount + fee

            sender_wallet = sender.wallet
            if sender_wallet.balance < total_debit:
                sender_wallet.balance = total_debit + Decimal("100")
                sender_wallet.save(update_fields=["balance"])

            sender_wallet.balance -= total_debit
            receiver.wallet.balance += amount
            sender_wallet.save(update_fields=["balance"])
            receiver.wallet.save(update_fields=["balance"])

            Transaction.objects.create(
                sender=sender,
                receiver=receiver,
                amount=amount,
                fee=fee,
                type="send",
                status="completed",
                note=self._send_note(),
            )

        for _ in range(self.PAYMENT_COUNT):
            if not verified_merchants or not active_users:
                break
            merchant = random.choice(verified_merchants)
            candidates = [u for u in active_users if u != merchant.user]
            if not candidates:
                continue
            sender = random.choice(candidates)
            amount = Decimal(str(random.randint(50, 3000)))
            fee = (amount * fee_rate).quantize(Decimal("0.01"))
            total_debit = amount + fee

            sender_wallet = sender.wallet
            if sender_wallet.balance < total_debit:
                sender_wallet.balance = total_debit + Decimal("100")
                sender_wallet.save(update_fields=["balance"])

            sender_wallet.balance -= total_debit
            merchant.user.wallet.balance += amount
            sender_wallet.save(update_fields=["balance"])
            merchant.user.wallet.save(update_fields=["balance"])

            Transaction.objects.create(
                sender=sender,
                receiver=merchant.user,
                merchant=merchant,
                amount=amount,
                fee=fee,
                type="payment",
                status="completed",
                note=f"Payment at {merchant.business_name}",
            )

        for _ in range(self.CASH_IN_COUNT):
            user = random.choice(users)
            amount = Decimal(str(random.randint(500, 10000)))
            user.wallet.balance += amount
            user.wallet.save(update_fields=["balance"])
            Transaction.objects.create(
                sender=None,
                receiver=user,
                amount=amount,
                fee=Decimal("0.00"),
                type="cash_in",
                status="completed",
                note=random.choice(["Agent cash in", "Bank deposit", "Salary top-up"]),
            )

        for _ in range(self.CASH_OUT_COUNT):
            sender = random.choice(active_users)
            amount = Decimal(str(random.randint(200, 5000)))
            fee = (amount * fee_rate).quantize(Decimal("0.01"))
            total_debit = amount + fee

            sender_wallet = sender.wallet
            if sender_wallet.balance < total_debit:
                sender_wallet.balance = total_debit + Decimal("100")
                sender_wallet.save(update_fields=["balance"])

            sender_wallet.balance -= total_debit
            sender_wallet.save(update_fields=["balance"])

            Transaction.objects.create(
                sender=sender,
                receiver=None,
                amount=amount,
                fee=fee,
                type="cash_out",
                status="completed",
                note=random.choice(
                    ["ATM withdrawal", "Agent cash out", "Emergency cash"]
                ),
            )

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
        notifications = [
            Notification(
                user=random.choice(users),
                message=random.choice(templates).format(
                    amount=random.randint(50, 10000)
                ),
                is_read=random.choices([True, False], weights=[40, 60])[0],
            )
            for _ in range(40)
        ]
        Notification.objects.bulk_create(notifications)
        self.stdout.write(f"  + {len(notifications)} notifications")

    def _unique_phone(self):
        prefixes = ["01711", "01811", "01911", "01611", "01511", "01311", "01412"]
        while True:
            phone = random.choice(prefixes) + str(random.randint(100000, 999999))
            if not User.objects.filter(phone=phone).exists():
                return phone

    def _unique_nid(self):
        while True:
            nid = str(random.randint(1000000000, 9999999999))
            if not User.objects.filter(nid=nid).exists():
                return nid

    def _send_note(self):
        return random.choice(
            [
                "House rent",
                "Grocery bill",
                "Tuition fee",
                "Medicine cost",
                "Transport bill",
                "Salary transfer",
                "Freelance payment",
                "Family support",
                "Business payment",
                "Utility bill",
            ]
        )

    def _print_summary(self, users, merchants):
        self.stdout.write(self.style.MIGRATE_HEADING("\n── Seed Summary ──"))
        self.stdout.write(f"  Users        : {len(users)}")
        self.stdout.write(f"  Merchants    : {len(merchants)}")
        self.stdout.write(f"  Cards        : {Card.objects.count()}")
        self.stdout.write(f"  Transactions : {Transaction.objects.count()}")
        self.stdout.write(f"  Notifications: {Notification.objects.count()}")
        self.stdout.write(f"\n  Password: {PASSWORD}")
        self.stdout.write(self.style.SUCCESS("  All users ready to log in.\n"))
