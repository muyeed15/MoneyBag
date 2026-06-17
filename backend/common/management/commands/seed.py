import random
from datetime import date
from decimal import Decimal

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import Foundation, User
from cards.models import Card
from charity.models import HawlTracking, Sadaqah, SadaqahJariyah, ZakatPayment
from merchants.models import Merchant
from notifications.models import Notification
from savings.models import MudarabahAccount, MudarabahContribution, MudarabahPlan
from transactions.models import Transaction

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

BD_FOUNDATIONS = [
    ("BRAC", "education", "NGO-0001", "Largest NGO in Bangladesh, focuses on education, healthcare, and poverty alleviation."),
    ("Jaago Foundation", "education", "NGO-0002", "Works to ensure quality education for underprivileged children."),
    ("Emon Foundation", "orphan", "NGO-0003", "Supports orphan children with education, shelter, and healthcare."),
    ("Musk Foundation", "health", "NGO-0004", "Provides free healthcare services in rural Bangladesh."),
    ("Al-Markazul Islami", "masjid", "NGO-0005", "Masjid development and Islamic education across Bangladesh."),
    ("Sharique Foundation", "poverty", "NGO-0006", "Poverty alleviation through microfinance and skill development."),
    ("Bidyanondo Foundation", "education", "NGO-0007", "Volunteer-based organization fighting hunger and illiteracy."),
    ("Dhaka Ahsania Mission", "health", "NGO-0008", "Healthcare, education, and sustainable development programs."),
    ("Sajida Foundation", "health", "NGO-0009", "Healthcare access for the underprivileged in urban slums."),
    ("Uttaran", "water", "NGO-0010", "Water, sanitation, and climate resilience in coastal areas."),
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

        self.stdout.write("Seeding foundations…")
        foundations = self._seed_foundations()

        self.stdout.write("Seeding cards…")
        self._seed_cards(users)

        self.stdout.write("Seeding Mudarabah plans…")
        plans = self._seed_mudarabah_plans()

        self.stdout.write("Seeding Mudarabah accounts…")
        self._seed_mudarabah_accounts(users, plans)

        self.stdout.write("Seeding transactions…")
        self._seed_transactions(users, merchants)

        self.stdout.write("Seeding zakat payments…")
        self._seed_zakat(users, foundations)

        self.stdout.write("Seeding sadaqah…")
        self._seed_sadaqah(users, foundations)

        self.stdout.write("Seeding notifications…")
        self._seed_notifications(users)

        self.stdout.write("Seeding Hawl tracking…")
        self._seed_hawl_tracking(users)

        self.stdout.write("Seeding Sadaqah Jariyah…")
        self._seed_sadaqah_jariyah(users, foundations)

        self.stdout.write(self.style.SUCCESS("\nSeeding complete."))
        self._print_summary(users, merchants, foundations)

    def _clear(self):
        SadaqahJariyah.objects.all().delete()
        HawlTracking.objects.all().delete()
        MudarabahContribution.objects.all().delete()
        MudarabahAccount.objects.all().delete()
        MudarabahPlan.objects.all().delete()
        Sadaqah.objects.all().delete()
        ZakatPayment.objects.all().delete()
        Notification.objects.all().delete()
        Transaction.objects.all().delete()
        Card.objects.all().delete()
        Merchant.objects.all().delete()
        Foundation.objects.all().delete()
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

    def _seed_mudarabah_plans(self):
        plans_data = [
            ("6-Month Mudarabah", 6, Decimal("1000"), Decimal("30.00")),
            ("1-Year Mudarabah", 12, Decimal("1000"), Decimal("40.00")),
            ("1-Year Premium Mudarabah", 12, Decimal("5000"), Decimal("45.00")),
            ("2-Year Mudarabah", 24, Decimal("2000"), Decimal("50.00")),
            ("3-Year Mudarabah", 36, Decimal("1500"), Decimal("55.00")),
            ("5-Year Mudarabah", 60, Decimal("1000"), Decimal("60.00")),
        ]
        plans = []
        for name, months, monthly, profit in plans_data:
            plan = MudarabahPlan.objects.create(
                name=name,
                duration_months=months,
                monthly_amount=monthly,
                profit_ratio=profit,
                is_active=True,
            )
            plans.append(plan)
            self.stdout.write(f"  + {name} — ৳{monthly}/mo x {months}m (profit: {profit}%)")
        return plans

    def _seed_mudarabah_accounts(self, users, plans):
        count = 0
        active_users = [u for u in users if u.wallet.status == "active"]
        for user in random.sample(active_users, min(8, len(active_users))):
            plan = random.choice(plans)
            account = MudarabahAccount.objects.create(user=user, plan=plan)

            paid = random.randint(1, min(plan.duration_months, 6))
            for i in range(1, paid + 1):
                MudarabahContribution.objects.create(
                    mudarabah_account=account,
                    installment_number=i,
                    amount=plan.monthly_amount,
                )
            account.total_deposited = plan.monthly_amount * paid
            account.update_expected_payout()
            account.save(update_fields=["total_deposited", "expected_payout"])
            count += 1
            self.stdout.write(f"  + {account.account_number} — {plan.name} ({paid}/{plan.duration_months} paid)")
        self.stdout.write(f"  + {count} Mudarabah accounts")

    def _seed_foundations(self):
        foundations = []
        for name, cause, reg_no, desc in BD_FOUNDATIONS:
            phone = "013" + str(random.randint(10000000, 99999999))
            user = User.objects.create_user(
                phone=phone,
                password=PASSWORD,
                full_name=name,
                nid=self._unique_nid(),
                role="foundation",
                is_verified=True,
            )
            foundation = Foundation.objects.create(
                user=user,
                organization_name=name,
                registration_number=reg_no,
                cause=cause,
                description=desc,
                is_verified=True,
            )
            user.wallet.balance = Decimal(str(random.randint(50000, 500000)))
            user.wallet.save(update_fields=["balance"])
            foundations.append(foundation)
            self.stdout.write(f"  + {name} ({cause})")
        self.stdout.write(f"  + {len(foundations)} foundations")
        return foundations

    def _seed_zakat(self, users, foundations):
        count = 0
        for user in random.sample(users, min(5, len(users))):
            wealth = Decimal(str(random.randint(100000, 2000000)))
            zakat = (wealth * Decimal("2.5")) / Decimal("100")
            foundation = random.choice(foundations)
            ZakatPayment.objects.create(
                user=user,
                recipient=foundation.user,
                amount=zakat.quantize(Decimal("0.01")),
                asset_type=random.choice(["cash", "gold", "business"]),
                hawl_year=2026,
            )
            foundation.user.wallet.balance += zakat.quantize(Decimal("0.01"))
            foundation.user.wallet.save(update_fields=["balance"])
            count += 1
        self.stdout.write(f"  + {count} zakat payments")

    def _seed_sadaqah(self, users, foundations):
        causes = [
            "Masjid renovation fund",
            "Orphan support",
            "Flood relief",
            "Iftaar for the poor",
            "Water well project",
            "Quran distribution",
            "Food bank",
            "Medical assistance",
        ]
        donations = [
            Sadaqah(
                user=random.choice(users),
                recipient=random.choice(foundations).user,
                amount=Decimal(str(random.randint(50, 5000))),
                cause=random.choice(causes),
            )
            for _ in range(20)
        ]
        for _ in range(3):
            user = random.choice(users)
            donations.append(
                Sadaqah(
                    user=user,
                    recipient=random.choice(foundations).user,
                    amount=Decimal(str(random.randint(100, 2000))),
                    cause="Anonymous sadaqah",
                    is_anonymous=True,
                )
            )
        Sadaqah.objects.bulk_create(donations)
        for d in donations:
            if d.recipient:
                d.recipient.wallet.balance += d.amount
                d.recipient.wallet.save(update_fields=["balance"])
        self.stdout.write(f"  + {len(donations)} sadaqah donations")

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

    def _ensure_balance(self, wallet, required):
        if wallet.balance < required:
            wallet.balance = required + Decimal("100")
            wallet.save(update_fields=["balance"])

    def _seed_send_transactions(self, active_users):
        fee_rate = Decimal(str(settings.TRANSFER_FEE_PERCENT)) / Decimal("100")
        for _ in range(self.SEND_COUNT):
            if len(active_users) < 2:
                break
            sender, receiver = random.sample(active_users, 2)
            amount = Decimal(str(random.randint(100, 5000)))
            fee = (amount * fee_rate).quantize(Decimal("0.01"))

            self._ensure_balance(sender.wallet, amount + fee)
            sender.wallet.balance -= amount + fee
            receiver.wallet.balance += amount
            sender.wallet.save(update_fields=["balance"])
            receiver.wallet.save(update_fields=["balance"])

            Transaction.objects.create(
                sender=sender, receiver=receiver,
                amount=amount, fee=fee,
                transaction_type="send", status="completed",
                note=self._send_note(),
            )

    def _seed_payment_transactions(self, active_users, verified_merchants):
        fee_rate = Decimal(str(settings.TRANSFER_FEE_PERCENT)) / Decimal("100")
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

            self._ensure_balance(sender.wallet, amount + fee)
            sender.wallet.balance -= amount + fee
            merchant.user.wallet.balance += amount
            sender.wallet.save(update_fields=["balance"])
            merchant.user.wallet.save(update_fields=["balance"])

            Transaction.objects.create(
                sender=sender, receiver=merchant.user,
                merchant=merchant, amount=amount, fee=fee,
                transaction_type="payment", status="completed",
                note=f"Payment at {merchant.business_name}",
            )

    def _seed_cash_in_transactions(self, users):
        for _ in range(self.CASH_IN_COUNT):
            user = random.choice(users)
            amount = Decimal(str(random.randint(500, 10000)))
            user.wallet.balance += amount
            user.wallet.save(update_fields=["balance"])
            Transaction.objects.create(
                sender=None, receiver=user,
                amount=amount, fee=Decimal("0.00"),
                transaction_type="cash_in", status="completed",
                note=random.choice(["Agent cash in", "Bank deposit", "Salary top-up"]),
            )

    def _seed_cash_out_transactions(self, active_users):
        fee_rate = Decimal(str(settings.TRANSFER_FEE_PERCENT)) / Decimal("100")
        for _ in range(self.CASH_OUT_COUNT):
            sender = random.choice(active_users)
            amount = Decimal(str(random.randint(200, 5000)))
            fee = (amount * fee_rate).quantize(Decimal("0.01"))

            self._ensure_balance(sender.wallet, amount + fee)
            sender.wallet.balance -= amount + fee
            sender.wallet.save(update_fields=["balance"])

            Transaction.objects.create(
                sender=sender, receiver=None,
                amount=amount, fee=fee,
                transaction_type="cash_out", status="completed",
                note=random.choice(["ATM withdrawal", "Agent cash out", "Emergency cash"]),
            )

    def _seed_transactions(self, users, merchants):
        active_users = [u for u in users if u.wallet.status == "active"]
        verified_merchants = [m for m in merchants if m.is_verified]
        self._seed_send_transactions(active_users)
        self._seed_payment_transactions(active_users, verified_merchants)
        self._seed_cash_in_transactions(users)
        self._seed_cash_out_transactions(active_users)

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
            "Welcome to Yaqeen!",
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

    def _seed_hawl_tracking(self, users):
        count = 0
        for user in random.sample(users, min(8, len(users))):
            HawlTracking.objects.update_or_create(
                user=user,
                defaults={
                    "is_eligible": True,
                    "nisab_crossed_at": timezone.now() - timezone.timedelta(days=random.randint(30, 300)),
                    "next_hawl_date": date.today() + timezone.timedelta(days=random.randint(30, 120)),
                },
            )
            count += 1
        self.stdout.write(f"  + {count} Hawl tracking records")

    def _seed_sadaqah_jariyah(self, users, foundations):
        causes = ["Water well", "Education fund", "Masjid construction", "Orphan care"]
        count = 0
        for user in random.sample(users, min(5, len(users))):
            foundation = random.choice(foundations)
            amount = Decimal(str(random.randint(100, 2000)))
            SadaqahJariyah.objects.create(
                user=user,
                recipient=foundation.user,
                amount=amount,
                cause=random.choice(causes),
                frequency="monthly",
                is_active=True,
                total_donated=amount,
            )
            foundation.user.wallet.balance += amount
            foundation.user.wallet.save(update_fields=["balance"])
            count += 1
        self.stdout.write(f"  + {count} Sadaqah Jariyah subscriptions")

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

    def _print_summary(self, users, merchants, foundations):
        self.stdout.write(self.style.MIGRATE_HEADING("\n── Seed Summary ──"))
        self.stdout.write(f"  Users           : {len(users)}")
        self.stdout.write(f"  Merchants       : {len(merchants)}")
        self.stdout.write(f"  Foundations     : {Foundation.objects.count()}")
        self.stdout.write(f"  Cards           : {Card.objects.count()}")
        self.stdout.write(f"  Transactions    : {Transaction.objects.count()}")
        self.stdout.write(f"  Mudarabah Accts : {MudarabahAccount.objects.count()}")
        self.stdout.write(f"  Zakat Paid      : {ZakatPayment.objects.count()}")
        self.stdout.write(f"  Sadaqah Given   : {Sadaqah.objects.count()}")
        self.stdout.write(f"  Sadaqah Jariyah : {SadaqahJariyah.objects.count()}")
        self.stdout.write(f"  Hawl Tracking   : {HawlTracking.objects.count()}")
        self.stdout.write(f"  Notifications   : {Notification.objects.count()}")
        self.stdout.write(f"\n  Password: {PASSWORD}")
        self.stdout.write(self.style.SUCCESS("  All users ready to log in.\n"))
