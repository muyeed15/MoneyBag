# MoneyBag Frontend

Next.js web app for the MoneyBag MFS — dashboard, transfers, transactions, notifications, and profile.

## Setup

```bash
npm install
cp env.example .env
npm run dev
```

Runs at `http://localhost:3000`. Requires the Django backend at `http://127.0.0.1:8000`.

## Environment Variables

```
ACCESS_TOKEN_MINUTES=30
REFRESH_TOKEN_MINUTES=30
```

Must match the backend `.env` values.

## Stack

- Next.js 16 · React 19 · TypeScript
- Tailwind CSS v4
- SWR for data fetching
- Framer Motion for animations
