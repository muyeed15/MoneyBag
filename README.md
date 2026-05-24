# MoneyBag

A full-stack Mobile Financial Service (MFS) web application for payments, transfers, and wallet management. Built with Django REST Framework on the backend and Next.js on the frontend.

## Tech Stack

| Layer     | Technology                                    |
|-----------|-----------------------------------------------|
| Backend   | Django 5.2, Django REST Framework, PostgreSQL |
| Auth      | JWT (SimpleJWT)                               |
| Frontend  | Next.js 16, React 19, TypeScript              |
| Styling   | Tailwind CSS v4                               |

## Project Structure

```
MoneyBag/
├── backend/        # Django REST API
└── frontend/       # Next.js web app
```

## Quick Start

### Backend

```bash
cd backend
conda create -n django python=3.12.13   # first time only
conda activate django
pip install -r requirements.txt          # first time only
python manage.py migrate
python manage.py runserver
```

API available at `http://127.0.0.1:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:3000`

> The frontend expects the backend running at `http://127.0.0.1:8000`. Make sure both servers are running together.

## Features

- Phone-number based user accounts with NID verification
- Wallet balance, daily limits, and status management
- Send, receive, cash-in, and cash-out transactions
- In-app notifications
- JWT-based authentication
- Django admin panel at `/admin`
