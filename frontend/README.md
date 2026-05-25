# MoneyBag Frontend

Next.js web app for the MoneyBag MFS. Covers dashboard, transfers, merchant payments, cards, transactions, notifications, and profile.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Runs at `http://localhost:3000`. Requires the Django backend at `http://127.0.0.1:8000`.

## Environment Variables

```
DJANGO_API_URL=http://localhost:8000
ACCESS_TOKEN_MINUTES=30
REFRESH_TOKEN_MINUTES=30
NEXT_PUBLIC_TOAST_DURATION_MS=6000
PAGE_SIZE=10
PAGE_SIZE_MAX=50
```

`ACCESS_TOKEN_MINUTES` and `REFRESH_TOKEN_MINUTES` must match the backend `.env` values.

`PAGE_SIZE` controls how many rows are requested per page. `PAGE_SIZE_MAX` is the maximum allowed — the backend enforces this ceiling regardless of what the frontend sends.

## Stack

- Next.js 16 · React 19 · TypeScript
- Tailwind CSS v4
- SWR for data fetching and optimistic updates

## Pages

| Route            | Description                                                             |
| ---------------- | ----------------------------------------------------------------------- |
| `/dashboard`     | Balance, quick actions, recent transactions, live notifications via SSE |
| `/send`          | Send money to another user by phone number                              |
| `/pay`           | Browse verified merchants and pay by selecting one                      |
| `/cards`         | View, add, block, and unblock debit/prepaid cards                       |
| `/transactions`  | Full paginated transaction history                                      |
| `/notifications` | Paginated notification list with per-item and bulk mark-read            |
| `/profile`       | User info, wallet summary, card count, sign out                         |

## Architecture Notes

- JWT tokens are stored in httpOnly cookies; Next.js Route Handlers act as a proxy to the Django API so tokens are never exposed to the browser.
- Server Components fetch initial data at request time; the dashboard revalidates via a persistent SSE connection proxied through a Next.js Route Handler. Other pages revalidate on focus/reconnect via SWR.
- Server Actions handle mutations (transfer, pay, add card, block card, unblock card, mark notifications read).
- All list endpoints are server-side paginated. The frontend sends `page` and `page_size` on every request; the backend enforces a hard maximum of `PAGE_SIZE_MAX` rows per page.
