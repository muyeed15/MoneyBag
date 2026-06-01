import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User, Wallet, Transaction, Notification, Card, Merchant, PaginatedResponse } from '@/types'

export type { User, Wallet, Transaction, Notification, Card, Merchant, PaginatedResponse }

const API = process.env.DJANGO_API_URL ?? 'http://localhost:8000'
const PAGE_SIZE = process.env.PAGE_SIZE ?? '10'

async function authHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function serverFetch<T>(path: string, label: string, page?: number): Promise<T> {
  const url = `${API}${path}${page !== undefined ? `?page=${page}&page_size=${PAGE_SIZE}` : ''}`
  try {
    const res = await fetch(url, {
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
export const getTransactions = (page = 1) => serverFetch<PaginatedResponse<Transaction>>('/api/transactions/', 'transactions', page)
export const getNotifications= (page = 1) => serverFetch<PaginatedResponse<Notification>>('/api/notifications/', 'notifications', page)
export const getCards        = (page = 1) => serverFetch<PaginatedResponse<Card>>('/api/cards/', 'cards', page)
export const getMerchants    = (page = 1) => serverFetch<PaginatedResponse<Merchant>>('/api/merchants/', 'merchants', page)

export async function getQRCode(): Promise<string> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  try {
    const res = await fetch(`${API}/api/qr/`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Failed to fetch QR code')
    const buf = Buffer.from(await res.arrayBuffer())
    return `data:image/png;base64,${buf.toString('base64')}`
  } catch {
    return ''
  }
}
