# MoneyBag Frontend

Next.js web application for the MoneyBag Mobile Financial Service. Provides a dashboard for viewing wallet balance, transaction history, and notifications.

## Tech Stack

- **Next.js 16** with App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing / redirect
│   ├── login/
│   │   └── page.tsx      # Login page
│   ├── dashboard/
│   │   └── page.tsx      # Main dashboard (profile, wallet, transactions)
│   └── actions.ts        # Server actions (auth)
├── lib/
│   └── api.ts            # API client for the Django backend
└── public/               # Static assets
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

> Requires the Django backend running at `http://127.0.0.1:8000`. See `../backend/README.md`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Root — redirects to `/login` or `/dashboard` |
| `/login` | Phone + password login form, issues JWT |
| `/dashboard` | User profile, wallet balance, recent transactions |
