# MoneyBag Backend

MoneyBag is a Mobile Financial Service (MFS) application built with Django and PostgreSQL. This backend handles user accounts, wallets, transactions, and notifications.

## Requirements

- Python 3.12+
- PostgreSQL
- pip

## Project Structure

```
backend/
├── manage.py
├── moneybag/          # Project configuration (settings, URLs)
└── core/              # Main app (users, wallets, transactions)
```

## Setup

### 1. Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # Linux/macOS
venv\Scripts\activate           # Windows
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure the database

Make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE moneybag_db;
```

The default database credentials in `moneybag/settings.py` are:

| Key      | Value        |
|----------|--------------|
| NAME     | moneybag_db  |
| USER     | postgres     |
| PASSWORD | 12345678     |
| HOST     | localhost    |
| PORT     | 5432         |

Update these values in `settings.py` if your setup is different.

### 4. Run migrations

```bash
python manage.py migrate
```

### 5. Seed the database (optional)

```bash
python manage.py seed
```

### 6. Create a superuser

```bash
python manage.py createsuperuser
```

### 7. Start the development server

```bash
python manage.py runserver
```

The server will be available at `http://127.0.0.1:8000`.

## Common Commands

| Command | Description |
|---|---|
| `python manage.py runserver` | Start the development server |
| `python manage.py migrate` | Apply all pending migrations |
| `python manage.py makemigrations` | Create new migrations from model changes |
| `python manage.py createsuperuser` | Create an admin user |
| `python manage.py seed` | Populate the database with sample data |
| `python manage.py shell` | Open the Django interactive shell |

## Admin Panel

Once the server is running, the Django admin panel is accessible at:

```
http://127.0.0.1:8000/admin
```

Log in with the superuser credentials you created.
