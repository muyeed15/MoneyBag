# MoneyBag Backend

Django REST API with JWT authentication, PostgreSQL, and a seed command for sample data.

## Setup

```bash
conda create -n moneybag python=3.12.13
conda activate moneybag
pip install -r requirements.txt
cp env.example .env
python manage.py migrate
python manage.py runserver
```

Runs at `http://127.0.0.1:8000`.

## Environment Variables

Copy `env.example` to `.env` and set token lifetimes (in minutes):

```
ACCESS_TOKEN_MINUTES=30
REFRESH_TOKEN_MINUTES=30
```

## Useful Commands

```bash
python manage.py seed              # populate with sample data
python manage.py createsuperuser   # create admin user
python manage.py migrate           # apply migrations
```

Admin panel: `http://127.0.0.1:8000/admin/`
