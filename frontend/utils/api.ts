import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User, Wallet, Transaction, Notification, Card, Merchant } from '@/types'

export type { User, Wallet, Transaction, Notification, Card, Merchant }

const API = process.env.DJANGO_API_URL ?? 'http://localhost:8000'

async function authHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function serverFetch<T>(path: string, label: string): Promise<T> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: await authHeaders(),
      cache: 'no-store',
    })
    if (res.status === 401) redirect('/login')
    if (!res.ok) throw new Error(`${res.status}`)
    return res.json()
  } catch (err) {
    if ((err as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw err
    throw new Error(`Could not load ${label}.`)
  }
}

export const getMe           = () => serverFetch<User>('/api/me/', 'user profile')
export const getWallet       = () => serverFetch<Wallet>('/api/wallet/', 'wallet')
export const getTransactions = () => serverFetch<Transaction[]>('/api/transactions/', 'transactions')
export const getNotifications= () => serverFetch<Notification[]>('/api/notifications/', 'notifications')
export const getCards        = () => serverFetch<Card[]>('/api/cards/', 'cards')
export const getMerchants    = () => serverFetch<Merchant[]>('/api/merchants/', 'merchants')
