import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const API = process.env.DJANGO_API_URL ?? 'http://localhost:8000'

export type User = {
  id: number
  phone: string
  full_name: string
  nid: string
  is_verified: boolean
  is_active: boolean
  has_merchant_profile: boolean
  created_at: string
}

export type Wallet = {
  id: number
  user_phone: string
  balance: string
  daily_limit: string
  status: 'active' | 'frozen'
  created_at: string
}

export type Transaction = {
  id: number
  reference_id: string
  sender_phone: string | null
  receiver_phone: string | null
  merchant_name: string | null
  amount: string
  fee: string
  type: 'send' | 'cash_in' | 'cash_out' | 'payment'
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  note: string | null
  created_at: string
}

export type Notification = {
  id: number
  message: string
  is_read: boolean
  created_at: string
}

export type Card = {
  id: number
  last_four: string
  card_type: 'debit' | 'prepaid'
  expiry_month: number
  expiry_year: number
  status: 'active' | 'blocked' | 'expired'
  created_at: string
}

export type Merchant = {
  id: number
  business_name: string
  category: string
  is_verified: boolean
  phone: string
}

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
