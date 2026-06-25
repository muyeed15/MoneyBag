import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type {
  User, Wallet, Transaction, Notification, Card, Merchant,
  PaginatedResponse, Foundation, MudarabahPlan, MudarabahAccount,
  MudarabahContribution, ZakatPayment, Sadaqah, HawlTracking, SadaqahJariyah,
} from '@/types'
import { logger } from './logger'

export type {
  User, Wallet, Transaction, Notification, Card, Merchant,
  PaginatedResponse, Foundation, MudarabahPlan, MudarabahAccount,
  MudarabahContribution, ZakatPayment, Sadaqah, HawlTracking, SadaqahJariyah,
}

const API = (process.env.DJANGO_API_URL ?? 'http://localhost:8000').replace('://0.0.0.0', '://127.0.0.1')
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
    logger.error('api:serverFetch', `Could not load ${label}`, { path, error: err })
    throw new Error(`Could not load ${label}.`)
  }
}

export const getMe              = () => serverFetch<User>('/api/me/', 'user profile')
export const getWallet          = () => serverFetch<Wallet>('/api/wallet/', 'wallet')
export const getTransactions    = (page = 1) => serverFetch<PaginatedResponse<Transaction>>('/api/transactions/', 'transactions', page)
export const getNotifications   = (page = 1) => serverFetch<PaginatedResponse<Notification>>('/api/notifications/', 'notifications', page)
export const getCards           = (page = 1) => serverFetch<PaginatedResponse<Card>>('/api/cards/', 'cards', page)
export const getMerchants       = (page = 1) => serverFetch<PaginatedResponse<Merchant>>('/api/merchants/', 'merchants', page)
export const getFoundations     = () => serverFetch<Foundation[]>('/api/foundations/', 'foundations')
export const getMudarabahPlans  = () => serverFetch<MudarabahPlan[]>('/api/mudarabah/plans/', 'mudarabah plans')
export const getMudarabahAccounts = (page = 1) => serverFetch<MudarabahAccount[]>('/api/mudarabah/accounts/', 'mudarabah accounts', page)
export const getMudarabahAccount = (accountNumber: string) => serverFetch<MudarabahAccount>(`/api/mudarabah/accounts/${accountNumber}/`, 'mudarabah account')
export const getMudarabahContributions = (accountNumber: string) => serverFetch<MudarabahContribution[]>(`/api/mudarabah/accounts/${accountNumber}/contributions/`, 'contributions')
export const getZakatHistory    = () => serverFetch<ZakatPayment[]>('/api/zakat/history/', 'zakat history')
export const getSadaqahHistory  = () => serverFetch<Sadaqah[]>('/api/sadaqah/history/', 'sadaqah history')
export const getHawl            = () => serverFetch<HawlTracking>('/api/hawl/', 'hawl tracking')
export const getSadaqahJariyahList = () => serverFetch<SadaqahJariyah[]>('/api/sadaqah-jariyah/', 'sadaqah jariyah')

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
  } catch (err) {
    logger.error('api:getQRCode', 'Failed to fetch QR code', err)
    return ''
  }
}
