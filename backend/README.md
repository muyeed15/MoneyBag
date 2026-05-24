# MoneyBag Backend

Django REST API for the MoneyBag Mobile Financial Service. Handles user accounts, wallets, transactions, and notifications with JWT authentication.

## Requirements

- Python 3.12+
- PostgreSQL
- Conda (recommended) or pip

## Project Structure

```
backend/
├── manage.py
├── core/               # Project configuration (settings, URLs, WSGI/ASGI)
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   ├── asgi.py
│   └── moneybag/       # Main app (users, wallets, transactions, notifications)
│       ├── models/
│       ├── views.py
│       ├── serializers.py
│       ├── urls.py
│       ├── signals.py
│       ├── admin.py
│       ├── migrations/
│       └── management/
│           └── commands/
│               └── seed.py
```

## Setup

### 1. Activate the environment

```bash
conda activate django
```

### 2. Configure the database

Make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE moneybag_db;
```

The default credentials in `core/settings.py` are:

| Key      | Value       |
|----------|-------------|
| NAME     | moneybag_db |
| USER     | postgres    |
| PASSWORD | 12345678    |
| HOST     | localhost   |
| PORT     | 5432        |

Update these in `core/settings.py` if your setup differs.

### 3. Run migrations

```bash
python manage.py migrate
```

### 4. Seed the database (optional)

```bash
python manage.py seed
```

Populates the database with Bangladeshi fake users, wallets, transactions, and notifications.

### 5. Create a superuser

```bash
python manage.py createsuperuser
```

### 6. Start the development server

```bash
python manage.py runserver
```

Server runs at `http://127.0.0.1:8000`.

## Common Commands

| Command | Description |
|---|---|
| `python manage.py runserver` | Start the development server |
| `python manage.py migrate` | Apply all pending migrations |
| `python manage.py makemigrations` | Create new migrations from model changes |
| `python manage.py createsuperuser` | Create an admin user |
| `python manage.py seed` | Populate the database with sample data |
| `python manage.py shell` | Open the Django interactive shell |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/token/` | Obtain JWT access and refresh tokens |
| POST | `/api/token/refresh/` | Refresh an access token |
| GET | `/api/me/` | Authenticated user's profile |
| GET | `/api/wallet/` | Authenticated user's wallet |
| GET | `/api/transactions/` | List the user's transactions |
| GET | `/api/transactions/<id>/` | Single transaction detail |
| GET | `/api/notifications/` | List the user's notifications |
| GET | `/api/notifications/<id>/` | Single notification detail |

All `/api/` routes (except token endpoints) require a `Bearer` JWT in the `Authorization` header.

## Admin Panel

```
http://127.0.0.1:8000/admin
```

Log in with the superuser credentials you created.
