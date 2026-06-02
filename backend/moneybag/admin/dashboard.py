import json
from datetime import date, timedelta

from django.db.models import Count, Sum
from django.db.models.functions import TruncDate

from moneybag.models import Transaction, User, Wallet


def dashboard_callback(request, context):
    today = date.today()
    thirty_days_ago = today - timedelta(days=29)

    total_users = User.objects.count()
    total_transactions = Transaction.objects.count()
    total_volume = (
        Transaction.objects.filter(status="completed").aggregate(v=Sum("amount"))["v"]
        or 0
    )
    total_fees = (
        Transaction.objects.filter(status="completed").aggregate(f=Sum("fee"))["f"] or 0
    )
    active_wallets = Wallet.objects.filter(status="active").count()

    daily_qs = (
        Transaction.objects.filter(
            status="completed",
            created_at__date__gte=thirty_days_ago,
        )
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(volume=Sum("amount"), count=Count("id"))
        .order_by("day")
    )

    date_index = {
        thirty_days_ago + timedelta(days=i): {"volume": 0, "count": 0}
        for i in range(30)
    }
    for row in daily_qs:
        if row["day"] in date_index:
            date_index[row["day"]]["volume"] = float(row["volume"])
            date_index[row["day"]]["count"] = row["count"]

    chart_labels = [d.strftime("%b %d") for d in sorted(date_index)]
    chart_volume = [date_index[d]["volume"] for d in sorted(date_index)]
    chart_count = [date_index[d]["count"] for d in sorted(date_index)]

    context.update(
        {
            "kpi": {
                "total_users": total_users,
                "total_transactions": total_transactions,
                "total_volume": round(float(total_volume), 2),
                "total_fees": round(float(total_fees), 2),
                "active_wallets": active_wallets,
            },
            "chart_labels_json": json.dumps(chart_labels),
            "chart_volume_json": json.dumps(chart_volume),
            "chart_count_json": json.dumps(chart_count),
        }
    )
    return context
