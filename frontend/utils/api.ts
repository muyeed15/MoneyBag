import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const API = 'http://localhost:8000'

export type User = {
  id: number
  phone: string
  full_name: string
  nid: string
  is_verified: boolean
  is_active: boolean
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
  amount: string
  fee: string
  type: 'send' | 'receive' | 'cash_in' | 'cash_out' | 'payment'
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

async function authHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getMe(): Promise<User> {
  const res = await fetch(`${API}/api/me/`, {
    headers: await authHeaders(),
    cache: 'no-store',
  })
  if (res.status === 401) redirect('/login')
  if (!res.ok) throw new Error('Failed to fetch user')
  return res.json()
}

export async function getWallet(): Promise<Wallet> {
  const res = await fetch(`${API}/api/wallet/`, {
    headers: await authHeaders(),
    cache: 'no-store',
  })
  if (res.status === 401) redirect('/login')
  if (!res.ok) throw new Error('Failed to fetch wallet')
  return res.json()
}

export async function getTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${API}/api/transactions/`, {
    headers: await authHeaders(),
    cache: 'no-store',
  })
  if (res.status === 401) redirect('/login')
  if (!res.ok) throw new Error('Failed to fetch transactions')
  return res.json()
}

export async function getNotifications(): Promise<Notification[]> {
  const res = await fetch(`${API}/api/notifications/`, {
    headers: await authHeaders(),
    cache: 'no-store',
  })
  if (res.status === 401) redirect('/login')
  if (!res.ok) throw new Error('Failed to fetch notifications')
  return res.json()
}
