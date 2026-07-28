# Yaqeen Frontend

Next.js web app for Yaqeen, a Sharia-compliant Islamic digital wallet.

> See the [project README](../README.md) for the full quick start and production deployment with PM2.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Runs at `http://localhost:3003` by default. Requires the Django backend at `http://127.0.0.1:8003`.

## Production

Build and start with PM2:

```bash
npm run build
pm2 start ../ecosystem.config.js --only yaqeen-frontend
```

The PM2 config (`ecosystem.config.js` at the project root) starts `server.mjs` with `NODE_ENV=production`.

### Running with HTTPS

For local development:

```bash
npm run dev:https         # development with HTTPS
```

For production, uncomment the `USE_HTTPS: 'true'` block in `ecosystem.config.js` and ensure certificates exist in `certificates/`.

## Environment Variables

```
DJANGO_API_URL=http://127.0.0.1:8003
ACCESS_TOKEN_MINUTES=1440
REFRESH_TOKEN_MINUTES=43200
NEXT_PUBLIC_TOAST_DURATION_MS=6000
NEXT_PUBLIC_LOG_LEVEL=info
PAGE_SIZE=10
NEXT_PUBLIC_SWR_REFRESH_INTERVAL=30000
```

`ACCESS_TOKEN_MINUTES` and `REFRESH_TOKEN_MINUTES` must match the backend `.env` values.

## Logging

Logs are written to `frontend/logs/` on the Next.js server (never in the browser console):

| File        | Contents                                               |
| ----------- | ------------------------------------------------------ |
| `error.log` | All errors (rotates at 10 MB)                          |
| `app.log`   | All app-level logs (info, warn, debug) (rotates at 10 MB) |

## Stack

- Next.js 16 · React 19 · TypeScript
- Tailwind CSS v4
- SWR for data fetching and optimistic updates

## Pages

| Route                              | Description                                                    |
|------------------------------------|----------------------------------------------------------------|
| `/`                                | Landing / welcome page                                         |
| `/login`                           | Sign in                                                        |
| `/dashboard`                       | Balance, quick actions, recent transactions, live SSE updates  |
| `/send`                            | Send money to another user by phone number                     |
| `/receive`                         | Display QR code for receiving money                            |
| `/pay`                             | Browse verified merchants and pay by selecting one             |
| `/cards`                           | List debit/prepaid cards                                       |
| `/cards/[id]`                      | Card detail, block, unblock                                    |
| `/transactions`                    | Full paginated transaction history                             |
| `/notifications`                   | Paginated notification list with per-item and bulk mark-read   |
| `/profile`                         | User info, wallet summary, card count                          |
| `/more`                            | Additional navigation / overflow menu                          |
| `/savings`                         | Mudarabah savings (DPS) overview                               |
| `/savings/accounts`                | List savings accounts                                          |
| `/savings/accounts/[number]`       | Savings account detail and contribution history                |
| `/charity`                         | Charity hub                                                    |
| `/charity/sadaqah`                 | Give voluntary charity                                         |
| `/charity/sadaqah-jariyah`         | Set up recurring charity                                       |
| `/charity/hawl`                    | Zakat eligibility (hawl / nisab) tracking                      |
| `/charity/zakat`                   | Zakat overview                                                 |
| `/charity/zakat/calculate`         | Zakat calculation form                                         |
| `/charity/zakat/pay`               | Pay zakat                                                      |
| `/charity/zakat/history`           | Zakat payment history                                          |

## Architecture Notes

- JWT tokens are stored in httpOnly cookies; Next.js Route Handlers act as a proxy to the Django API so tokens are never exposed to the browser.
- Server Components fetch initial data at request time; the dashboard revalidates via a persistent SSE connection proxied through a Next.js Route Handler. Other pages revalidate on focus/reconnect via SWR.
- Server Actions handle mutations (transfer, pay, add card, block card, unblock card, mark notifications read).
- All list endpoints are server-side paginated. The frontend sends `page` and `page_size` on every request; the backend enforces a hard maximum of rows per page.
