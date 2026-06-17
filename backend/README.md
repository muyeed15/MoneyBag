# Yaqeen Backend

Sharia-compliant Islamic digital wallet API. Django REST + JWT + PostgreSQL.

**Islamic features:** Mudarabah-based DPS savings, Zakat calculation & payment, Sadaqah giving.

## Setup

```bash
conda create -n yaqeen python=3.12.13
conda activate yaqeen
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

Runs at `http://127.0.0.1:8000`.

## Environment Variables

```
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=yaqeen_db
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
DB_CONN_MAX_AGE=60

ACCESS_TOKEN_MINUTES=1440
REFRESH_TOKEN_MINUTES=43200
TRANSFER_FEE_PERCENT=1.5
PAGE_SIZE=10
PAGE_SIZE_MAX=50
```

## Project Structure

```
config/          Django project settings, root URL config, WSGI/ASGI
accounts/        User and Wallet models, views, serializers, admin
cards/           Card model, views, serializers, admin
transactions/    Transaction model, views, serializers, admin
merchants/       Merchant model, views, serializers, admin
notifications/   Notification model, views, serializers, admin
savings/         Islamic DPS (Mudarabah savings plans)
charity/         Zakat calculation/payment and Sadaqah
common/          Shared utilities: pagination, middleware, seed command
```

## Models

| Model            | App          | Description |
|------------------|--------------|-------------|
| `User`           | `accounts`   | Custom user with phone + NID |
| `Wallet`         | `accounts`   | Balance, daily limit, status |
| `Transaction`    | `transactions`| Send, payment, cash in/out records |
| `Notification`   | `notifications`| Per-user messages |
| `Card`           | `cards`      | Debit/prepaid cards |
| `Merchant`       | `merchants`  | Business profiles |
| `DPSPlan`        | `savings`    | Mudarabah savings plans (duration, monthly amount, profit ratio) |
| `DPSAccount`     | `savings`    | User enrollment in a DPS plan |
| `DPSInstallment` | `savings`    | Monthly installment payments |
| `ZakatPayment`   | `charity`    | Zakat payments with wealth snapshot |
| `Sadaqah`        | `charity`    | Voluntary charity records |

## API Endpoints

All endpoints require `Authorization: Bearer <token>` unless noted.

| Method     | URL                                   | Description |
|------------|---------------------------------------|-------------|
| POST       | `/api/token/`                         | Obtain JWT (login) |
| POST       | `/api/token/refresh/`                 | Refresh JWT |
| GET        | `/api/me/`                            | User profile |
| GET        | `/api/wallet/`                        | Wallet balance |
| POST       | `/api/transfer/`                      | Send money |
| GET        | `/api/merchants/`                     | List verified merchants |
| POST       | `/api/pay/merchant/`                  | Pay a merchant |
| GET, POST  | `/api/cards/`                         | List/add cards |
| PATCH      | `/api/cards/<id>/block/`              | Block card |
| PATCH      | `/api/cards/<id>/unblock/`            | Unblock card |
| GET        | `/api/transactions/`                  | Transaction history |
| GET        | `/api/transactions/<id>/`             | Transaction detail |
| GET        | `/api/notifications/`                 | Notification list |
| GET        | `/api/notifications/stream/`          | SSE notification stream |
| POST       | `/api/notifications/read-all/`        | Mark all read |
| GET, PATCH | `/api/notifications/<id>/`            | Detail / mark read |
| GET        | `/api/dps/plans/`                     | List DPS plans |
| GET, POST  | `/api/dps/accounts/`                  | List / open DPS account |
| GET        | `/api/dps/accounts/<id>/`             | DPS account detail |
| POST       | `/api/dps/pay/`                       | Pay monthly installment |
| GET        | `/api/dps/accounts/<id>/installments/`| Installment history |
| POST       | `/api/zakat/calculate/`               | Calculate zakat due |
| POST       | `/api/zakat/pay/`                     | Pay zakat |
| GET        | `/api/zakat/history/`                 | Zakat payment history |
| POST       | `/api/sadaqah/`                       | Give sadaqah |
| GET        | `/api/sadaqah/history/`               | Sadaqah history |

## Useful Commands

```bash
python manage.py seed              # populate with sample data (password: 12345678)
python manage.py createsuperuser   # create admin user
python manage.py migrate           # apply migrations
python manage.py test              # run tests
```
