'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getWallet, getTransactions, getNotifications } from '@/lib/api'

export type LoginState = {
  error: string | null
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string

  if (!phone || !password) {
    return { error: 'Phone and password are required.' }
  }

  let data: { access: string; refresh: string }

  try {
    const res = await fetch('http://localhost:8000/api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const msg =
        body?.detail ?? body?.non_field_errors?.[0] ?? 'Invalid phone or password.'
      return { error: msg }
    }

    data = await res.json()
  } catch {
    return { error: 'Could not reach the server. Is Django running?' }
  }

  const cookieStore = await cookies()
  cookieStore.set('access_token', data.access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 5, // 5 minutes (matches simplejwt default)
  })
  cookieStore.set('refresh_token', data.refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  })

  redirect('/dashboard')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  redirect('/login')
}

// ── Transfer ──────────────────────────────────────────────────────────────────

export type TransferState = {
  error: string | null
  success: boolean
}

export async function transferAction(
  _prev: TransferState,
  formData: FormData,
): Promise<TransferState> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) return { error: 'Not authenticated.', success: false }

  const receiver_phone = formData.get('receiver_phone') as string
  const amount = formData.get('amount') as string
  const note = (formData.get('note') as string) || ''

  try {
    const res = await fetch('http://localhost:8000/api/transfer/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ receiver_phone, amount, note }),
    })

    const data = await res.json()
    if (!res.ok) return { error: data.detail ?? 'Transfer failed.', success: false }
    return { error: null, success: true }
  } catch {
    return { error: 'Could not reach the server.', success: false }
  }
}

// ── Polling helpers (called by client components on an interval) ──────────────

export async function fetchWalletAction()        { return getWallet() }
export async function fetchTransactionsAction()  { return getTransactions() }
export async function fetchNotificationsAction() { return getNotifications() }
