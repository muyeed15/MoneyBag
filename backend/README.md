# Yaqeen Backend

Sharia-compliant Islamic digital wallet API. Django REST + JWT + PostgreSQL.

**Islamic features:** Mudarabah savings, Zakat calculation & payment, Sadaqah giving.

> See the [project README](../README.md) for the full quick start and production deployment with PM2.

## Setup

```bash
conda create -n yaqeen python=3.12.13
conda activate yaqeen
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed
python manage.py runserver 8003
```

Runs at `http://127.0.0.1:8003`.

## Production

The backend runs under PM2 via `gunicorn` inside the `yaqeen` conda environment. See the [project README](../README.md#production) for startup commands.

## Environment Variables

```
SECRET_KEY=django-insecure-changeme
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=yaqeen_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
DB_CONN_MAX_AGE=60

ACCESS_TOKEN_MINUTES=1440
REFRESH_TOKEN_MINUTES=43200
DJANGO_PORT=8003

TRANSFER_FEE_PERCENT=1.5
PAGE_SIZE=10
PAGE_SIZE_MAX=50
```

## Project Structure

```
config/          Django project settings, root URL config, WSGI/ASGI
accounts/        User, Wallet, and Foundation models, views, serializers
cards/           Card model, views, serializers
transactions/    Transaction model, views, serializers
merchants/       Merchant model, views, serializers
notifications/   Notification model, views, serializers
savings/         Mudarabah savings plans, accounts, contributions
charity/         Zakat, Sadaqah, Hawl tracking, Sadaqah Jariyah
common/          Shared utilities: pagination, middleware, seed command
```

## Models

| Model               | App            | Description |
|---------------------|----------------|-------------|
| `User`              | `accounts`     | Custom user with phone + NID |
| `Wallet`            | `accounts`     | Balance, daily limit, status |
| `Foundation`        | `accounts`     | Verified charitable organizations |
| `Transaction`       | `transactions` | Send, payment, cash in/out records |
| `Notification`      | `notifications`| Per-user messages |
| `Card`              | `cards`        | Debit/prepaid cards |
| `Merchant`          | `merchants`    | Business profiles |
| `MudarabahPlan`     | `savings`      | Savings plan (duration, monthly amount, profit ratio) |
| `MudarabahAccount`  | `savings`      | User enrollment in a Mudarabah plan |
| `MudarabahContribution` | `savings` | Monthly contribution payments |
| `ZakatPayment`      | `charity`      | Zakat payments with wealth snapshot |
| `Sadaqah`           | `charity`      | Voluntary charity records |
| `HawlTracking`      | `charity`      | Zakat eligibility (hawl / nisab) tracking |
| `SadaqahJariyah`    | `charity`      | Recurring charity subscriptions |

## API Endpoints

All endpoints require `Authorization: Bearer <token>` unless noted.

| Method     | URL                                              | Description |
|------------|--------------------------------------------------|-------------|
| POST       | `/api/token/`                                    | Obtain JWT (login) |
| POST       | `/api/token/refresh/`                            | Refresh JWT |
| GET        | `/api/me/`                                       | User profile |
| GET        | `/api/wallet/`                                   | Wallet balance |
| GET        | `/api/qr/`                                       | Generate QR code |
| GET        | `/api/foundations/`                              | List verified foundations |
| GET        | `/api/foundations/<pk>/`                         | Foundation detail |
| POST       | `/api/transfer/`                                 | Send money |
| GET        | `/api/merchants/`                                | List verified merchants |
| POST       | `/api/pay/merchant/`                             | Pay a merchant |
| GET, POST  | `/api/cards/`                                    | List / add cards |
| PATCH      | `/api/cards/<pk>/block/`                         | Block card |
| PATCH      | `/api/cards/<pk>/unblock/`                       | Unblock card |
| GET        | `/api/transactions/`                             | Transaction history |
| GET        | `/api/transactions/<pk>/`                        | Transaction detail |
| GET        | `/api/notifications/`                            | Notification list |
| GET        | `/api/notifications/stream/`                     | SSE notification stream |
| POST       | `/api/notifications/read-all/`                   | Mark all read |
| GET, PATCH | `/api/notifications/<pk>/`                       | Detail / mark read |
| GET        | `/api/mudarabah/plans/`                          | List Mudarabah plans |
| GET, POST  | `/api/mudarabah/accounts/`                       | List / open account |
| GET        | `/api/mudarabah/accounts/<account_number>/`      | Account detail |
| POST       | `/api/mudarabah/pay/`                            | Pay monthly contribution |
| GET        | `/api/mudarabah/accounts/<account_number>/contributions/` | Contribution history |
| POST       | `/api/zakat/calculate/`                          | Calculate zakat due |
| POST       | `/api/zakat/pay/`                                | Pay zakat |
| GET        | `/api/zakat/history/`                            | Zakat payment history |
| GET, PATCH | `/api/hawl/`                                     | Hawl / nisab tracking |
| POST       | `/api/sadaqah/`                                  | Give sadaqah |
| GET        | `/api/sadaqah/history/`                          | Sadaqah history |
| GET, POST  | `/api/sadaqah-jariyah/`                          | List / create recurring charity |
| GET, PATCH | `/api/sadaqah-jariyah/<donation_id>/`            | Recurring charity detail |

## Useful Commands

```bash
python manage.py seed              # populate with sample data (password: 12345678)
python manage.py createsuperuser   # create admin user
python manage.py migrate           # apply migrations
python manage.py test              # run tests
```
