# MoneyBag Backend

Django REST API with JWT authentication, PostgreSQL, and a seed command for sample data.

## Setup

```bash
conda create -n moneybag python=3.12.13
conda activate moneybag
pip install -r requirements.txt
cp env.example .env
python manage.py makemigrations moneybag
python manage.py migrate
python manage.py runserver
```

Runs at `http://127.0.0.1:8000`.

## Environment Variables

Copy `env.example` to `.env`:

```
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=moneybag_db
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
DB_CONN_MAX_AGE=60

CORS_ALLOWED_ORIGINS=http://localhost:3000

ACCESS_TOKEN_MINUTES=30
REFRESH_TOKEN_MINUTES=30
TRANSFER_FEE_PERCENT=1.5
```

## Project Structure

```
moneybag/
├── admin/          # per-model admin registrations
├── models/         # one file per model
├── serializers/    # one file per model; action serializers co-located with their model
├── signals/        # one file per signal group
├── tests/
│   ├── helpers.py          # shared make_user / make_wallet factories
│   ├── test_models.py
│   └── test_transfer.py
└── views/          # one file per feature area
```

## Models

| Model          | Description                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------- |
| `User`         | Custom user with phone + NID, `is_verified` / `is_active` flags                               |
| `Wallet`       | One-to-one with User; balance, daily limit, status                                            |
| `Transaction`  | Records send, payment, cash_in, cash_out; links sender/receiver wallets and optional merchant |
| `Notification` | Per-user messages with `is_read` flag                                                         |
| `Card`         | Debit/prepaid cards linked to User; stores last four digits, expiry, status                   |
| `Merchant`     | Business profile OneToOne with User; category, `is_verified` flag                             |

## API Endpoints

All endpoints require `Authorization: Bearer <token>` unless noted.

| Method     | URL                            | Description                     |
| ---------- | ------------------------------ | ------------------------------- |
| POST       | `/api/token/`                  | Obtain JWT (login)              |
| POST       | `/api/token/refresh/`          | Refresh JWT                     |
| GET        | `/api/me/`                     | Authenticated user profile      |
| GET        | `/api/wallet/`                 | Wallet balance and limits       |
| POST       | `/api/transfer/`               | Send money to another user      |
| GET        | `/api/merchants/`              | List verified merchants         |
| POST       | `/api/pay/merchant/`           | Pay a merchant                  |
| GET, POST  | `/api/cards/`                  | List cards / add a card         |
| PATCH      | `/api/cards/<id>/block/`       | Block a card                    |
| GET        | `/api/transactions/`           | Transaction history             |
| GET        | `/api/transactions/<id>/`      | Transaction detail              |
| GET        | `/api/notifications/`          | Notification list               |
| POST       | `/api/notifications/read-all/` | Mark all notifications read     |
| GET, PATCH | `/api/notifications/<id>/`     | Notification detail / mark read |

## Useful Commands

```bash
python manage.py seed              # populate with sample data (all passwords: 12345678)
python manage.py createsuperuser   # create admin user
python manage.py migrate           # apply migrations
python manage.py test              # run tests
```

Admin panel: `http://127.0.0.1:8000/admin/`
