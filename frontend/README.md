# MoneyBag Frontend

Next.js web application for the MoneyBag Mobile Financial Service. Provides a full-featured wallet dashboard — balance overview, peer-to-peer transfers, transaction history, notifications, and user profile.

## Tech Stack

- **Next.js 16** with App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** — page transitions and animated UI
- **Lucide React** — icons

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx                  # Root HTML shell (fonts, globals.css)
│   ├── page.tsx                    # Root redirect → /login
│   ├── globals.css                 # Tailwind base + custom design tokens
│   ├── actions.ts                  # All server actions (auth, transfer, polling)
│   ├── login/
│   │   └── page.tsx                # Public login page
│   └── (app)/                      # Authenticated route group
│       ├── layout.tsx              # Shared layout: fetches user + unread count → AppShell
│       ├── dashboard/
│       │   ├── page.tsx            # Server component: fetches wallet, transactions, notifications
│       │   └── DashboardClient.tsx # Client component: live polling, toasts, quick actions
│       ├── send/
│       │   └── page.tsx            # Send Money form
│       ├── transactions/
│       │   └── page.tsx            # Full transaction history (table + mobile list)
│       ├── notifications/
│       │   └── page.tsx            # Notification feed
│       └── profile/
│           └── page.tsx            # User info, wallet details, sign out
├── components/
│   ├── layout/
│   │   └── AppShell.tsx            # Sidebar (desktop) + bottom nav (mobile), notification badge
│   └── ui/
│       ├── Badge.tsx               # Status chip (success / warning / danger / neutral)
│       ├── Button.tsx              # Multi-variant button with loading spinner
│       ├── Input.tsx               # Labeled input with error + hint states
│       ├── PageTransition.tsx      # Fade-in wrapper for page content
│       ├── SuccessModal.tsx        # Post-transfer confirmation overlay
│       └── Toast.tsx               # Slide-in notification toasts (ToastStack)
├── lib/
│   ├── api.ts                      # Typed API client for the Django backend
│   └── utils.ts                    # Formatting helpers + getTxMeta
└── public/                         # Static assets
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

| Command         | Description                                  |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Start the development server with hot reload |
| `npm run build` | Build for production                         |
| `npm run start` | Start the production server                  |
| `npm run lint`  | Run ESLint                                   |

---

## Pages

### `/` — Root redirect (`app/page.tsx`)

A server component that immediately redirects to `/login`. No UI is rendered.

---

### `/login` — Login (`app/login/page.tsx`)

Public page. Accepts a **phone number** and **password**. Submits via the `loginAction` server action, which calls `POST /api/token/` on the Django backend, sets `access_token` and `refresh_token` as `httpOnly` cookies, then redirects to `/dashboard`. Inline error messages are shown for bad credentials or a downed server.

---

### `/dashboard` — Dashboard (`app/(app)/dashboard/`)

The home screen after login. Split into two files:

- **`page.tsx`** (server component) — Fetches wallet, transactions, and notifications in parallel using `Promise.all`, then passes all data as props to `DashboardClient`.
- **`DashboardClient.tsx`** (client component) — Renders the wallet balance card, four quick-action buttons (Send Money, Cash Out, Make Payment, Fund Transfer), and the six most-recent transactions. Polls the backend every **5 seconds** to refresh data. Any new notifications that arrive since page load are surfaced as toasts via `ToastStack`.

Quick actions are disabled (greyed out, `pointer-events-none`) when the wallet status is `frozen`.

---

### `/send` — Send Money (`app/(app)/send/page.tsx`)

A client component form for peer-to-peer transfers. Fields: recipient phone, amount (BDT), optional note. Submits via the `transferAction` server action. On success, renders `SuccessModal` with the amount and recipient phone; clicking "Done" navigates back to `/dashboard`. Animated error banner appears inline on failure.

---

### `/transactions` — Transaction History (`app/(app)/transactions/page.tsx`)

Server component. Fetches all transactions and renders:

- **Desktop (`sm:` and up)** — a full table with columns: Type, Counterparty, Status, Date, Amount. Fee shown as a sub-line when non-zero.
- **Mobile** — a stacked card list with type, counterparty, date, and amount.

Transaction display metadata (label, color, debit/credit direction) is derived per-row using `getTxMeta` from `lib/utils.ts`.

---

### `/notifications` — Notifications (`app/(app)/notifications/page.tsx`)

Server component. Fetches all notifications sorted by recency. Unread items have an orange left border and a dot indicator. The header shows a badge with the unread count when non-zero.

---

### `/profile` — Profile (`app/(app)/profile/page.tsx`)

Server component. Fetches user and wallet data in parallel. Displays:

- Identity block (avatar initials, full name, phone, verified/active badges)
- Personal information table (name, phone, NID, member since)
- Wallet table (balance, daily limit, status)
- Sign Out button wired to `logoutAction`

---

## Route Group: `(app)` — Authenticated Shell (`app/(app)/layout.tsx`)

Wraps all authenticated pages. Fetches the current user and notification count on the server, then renders `AppShell` with those values as props. Any unauthenticated request (missing or expired token) is caught in `lib/api.ts` and redirected to `/login` before this layout runs.

---

## Components

### `AppShell` (`components/layout/AppShell.tsx`)

The persistent navigation frame for all authenticated pages.

- **Desktop**: fixed `w-52` navy sidebar with brand name, nav links, and a user info + sign-out footer.
- **Mobile**: fixed bottom tab bar with 5 nav items.
- Active route is highlighted. The Notifications link shows a live unread badge that polls every 5 seconds client-side.

Nav items: Home → `/dashboard`, Transactions → `/transactions`, Send Money → `/send` (orange accent), Alerts → `/notifications`, Profile → `/profile`.

---

### `Button` (`components/ui/Button.tsx`)

```tsx
<Button variant="cta" size="lg" loading={pending}>
  Submit
</Button>
```

| Prop      | Type                                                  | Default   | Description                                               |
| --------- | ----------------------------------------------------- | --------- | --------------------------------------------------------- |
| `variant` | `primary \| cta \| secondary \| ghost \| destructive` | `primary` | Visual style                                              |
| `size`    | `sm \| md \| lg`                                      | `md`      | Height + padding                                          |
| `loading` | `boolean`                                             | `false`   | Shows a spinning `Loader2` icon; also disables the button |

Extends all native `<button>` HTML attributes.

---

### `Input` (`components/ui/Input.tsx`)

```tsx
<Input
  label="Phone Number"
  name="phone"
  type="tel"
  error={err}
  hint="BD format"
/>
```

| Prop    | Type     | Description                                                   |
| ------- | -------- | ------------------------------------------------------------- |
| `label` | `string` | Renders a `<label>` above the field; auto-generates `htmlFor` |
| `error` | `string` | Red border + error text below                                 |
| `hint`  | `string` | Muted helper text below (hidden when `error` is set)          |

Forwarded ref component — compatible with `useActionState` and `react-hook-form`.

---

### `Badge` (`components/ui/Badge.tsx`)

```tsx
<Badge variant="success">Completed</Badge>
```

| Variant   | Color                |
| --------- | -------------------- |
| `success` | Emerald              |
| `warning` | Amber                |
| `danger`  | Red                  |
| `neutral` | Sage/muted (default) |

Used to display transaction statuses across the dashboard and transactions page.

---

### `PageTransition` (`components/ui/PageTransition.tsx`)

```tsx
<PageTransition>{children}</PageTransition>
```

Wraps page content in a Framer Motion `opacity: 0 → 1` fade over 180 ms. Applied to every authenticated page for a consistent navigation feel.

---

### `SuccessModal` (`components/ui/SuccessModal.tsx`)

```tsx
<SuccessModal
  amount="500.00"
  receiverPhone="01XXXXXXXXX"
  onClose={handleClose}
/>
```

Full-screen overlay shown after a successful transfer. Displays the sent amount (formatted BDT) and recipient phone. The "Done" button calls `onClose` and pushes to `/dashboard`.

| Prop            | Type         | Description                                                 |
| --------------- | ------------ | ----------------------------------------------------------- |
| `amount`        | `string`     | Raw amount string — formatted internally via `formatAmount` |
| `receiverPhone` | `string`     | Recipient phone number                                      |
| `onClose`       | `() => void` | Called when the user dismisses the modal                    |

---

### `ToastStack` (`components/ui/Toast.tsx`)

```tsx
<ToastStack toasts={toasts} onDismiss={dismissToast} />
```

Fixed top-right stack of slide-in toast notifications. Each toast auto-dismisses after 6 seconds (timer managed by the parent). Rendered via `AnimatePresence` for smooth enter/exit animations.

| Prop        | Type                   | Description                                |
| ----------- | ---------------------- | ------------------------------------------ |
| `toasts`    | `Toast[]`              | Array of `{ id: number, message: string }` |
| `onDismiss` | `(id: number) => void` | Called when the × button is clicked        |

---

## Server Actions (`app/actions.ts`)

All server-side mutations and polling helpers. They run exclusively on the server — never exposed to the client bundle.

| Action                     | Description                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `loginAction`              | Validates phone + password, calls `POST /api/token/`, sets JWT cookies, redirects to `/dashboard`               |
| `logoutAction`             | Deletes `access_token` and `refresh_token` cookies, redirects to `/login`                                       |
| `transferAction`           | Calls `POST /api/transfer/` with the access token; returns `{ success, amount, receiver_phone }` or `{ error }` |
| `fetchWalletAction`        | Re-exports `getWallet()` for client-side polling                                                                |
| `fetchTransactionsAction`  | Re-exports `getTransactions()` for client-side polling                                                          |
| `fetchNotificationsAction` | Re-exports `getNotifications()` for client-side polling                                                         |

---

## API Client (`lib/api.ts`)

Thin typed wrapper around `fetch`. Every call reads the `access_token` cookie server-side. A missing token redirects to `/login`; a `401` response also redirects to `/login`.

**Base URL**: `http://localhost:8000/api`

| Function             | Endpoint              | Returns          |
| -------------------- | --------------------- | ---------------- |
| `getMe()`            | `GET /me/`            | `User`           |
| `getWallet()`        | `GET /wallet/`        | `Wallet`         |
| `getTransactions()`  | `GET /transactions/`  | `Transaction[]`  |
| `getNotifications()` | `GET /notifications/` | `Notification[]` |

**Type definitions** (`User`, `Wallet`, `Transaction`, `Notification`) are exported from this file and re-used across pages and components.

---

## Utility Helpers (`lib/utils.ts`)

| Function                  | Description                                                                                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cn(...classes)`          | Merges Tailwind classes with `clsx` + `tailwind-merge`                                                                                                                        |
| `formatAmount(amount)`    | Formats a decimal string as `৳ 1,234.50` (BD locale)                                                                                                                          |
| `formatDate(iso)`         | Formats an ISO timestamp as `24 May 2026, 10:30 AM`                                                                                                                           |
| `formatRelativeTime(iso)` | Returns `Just now`, `5m ago`, `2h ago`, `3d ago`, or falls back to `formatDate`                                                                                               |
| `getInitials(name)`       | Returns up to 2 uppercase initials from a full name                                                                                                                           |
| `getTxMeta(tx, myPhone)`  | Derives `{ label, color, minus, counterparty, direction }` from the logged-in user's perspective — a `send` tx appears as "Sent" to the sender and "Received" to the receiver |

---

## Authentication Flow

1. User submits login form → `loginAction` runs on the server.
2. JWT tokens stored as `httpOnly` cookies (`access_token`: 5 min, `refresh_token`: 1 day).
3. Every page under `(app)/` calls `lib/api.ts` functions which read the cookie and attach `Authorization: Bearer <token>`.
4. A `401` or missing token triggers an immediate server-side `redirect('/login')`.
5. Logout deletes both cookies and redirects to `/login`.

> Token refresh is not yet implemented. When `access_token` expires, the user is redirected to `/login` automatically.
