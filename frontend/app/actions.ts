'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const API = process.env.DJANGO_API_URL ?? 'http://localhost:8000'

async function token(): Promise<string | undefined> {
  return (await cookies()).get('access_token')?.value
}

export type LoginState = { error: string | null }

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string

  if (!phone || !password) return { error: 'Phone and password are required.' }

  let data: { access: string; refresh: string }
  try {
    const res = await fetch(`${API}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return { error: body?.detail ?? body?.non_field_errors?.[0] ?? 'Invalid phone or password.' }
    }
    data = await res.json()
  } catch {
    return { error: 'Could not reach the server. Is Django running?' }
  }

  const cookieStore = await cookies()
  const accessMinutes  = parseInt(process.env.ACCESS_TOKEN_MINUTES  ?? '30')
  const refreshMinutes = parseInt(process.env.REFRESH_TOKEN_MINUTES ?? '30')

  cookieStore.set('access_token', data.access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: accessMinutes * 60,
  })
  cookieStore.set('refresh_token', data.refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: refreshMinutes * 60,
  })

  redirect('/dashboard')
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  redirect('/login')
}

export type TransferState = {
  error: string | null
  success: boolean
  amount?: string
  receiver_phone?: string
}

export async function transferAction(
  _prev: TransferState,
  formData: FormData,
): Promise<TransferState> {
  const tok = await token()
  if (!tok) return { error: 'Not authenticated.', success: false }

  const receiver_phone = formData.get('receiver_phone') as string
  const amount = formData.get('amount') as string
  const note = (formData.get('note') as string) || ''

  try {
    const res = await fetch(`${API}/api/transfer/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
      body: JSON.stringify({ receiver_phone, amount, note }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.detail ?? 'Transfer failed.', success: false }
    return { error: null, success: true, amount, receiver_phone }
  } catch {
    return { error: 'Could not reach the server.', success: false }
  }
}

export type MerchantPayState = {
  error: string | null
  success: boolean
  amount?: string
  merchant_name?: string
}

export async function merchantPayAction(
  _prev: MerchantPayState,
  formData: FormData,
): Promise<MerchantPayState> {
  const tok = await token()
  if (!tok) return { error: 'Not authenticated.', success: false }

  const merchant_id = formData.get('merchant_id') as string
  const merchant_name = formData.get('merchant_name') as string
  const amount = formData.get('amount') as string
  const note = (formData.get('note') as string) || ''

  try {
    const res = await fetch(`${API}/api/pay/merchant/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
      body: JSON.stringify({ merchant_id: parseInt(merchant_id), amount, note }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.detail ?? 'Payment failed.', success: false }
    return { error: null, success: true, amount, merchant_name }
  } catch {
    return { error: 'Could not reach the server.', success: false }
  }
}

export type AddCardState = {
  error: string | null
  success: boolean
}

export async function addCardAction(
  _prev: AddCardState,
  formData: FormData,
): Promise<AddCardState> {
  const tok = await token()
  if (!tok) return { error: 'Not authenticated.', success: false }

  const last_four    = formData.get('last_four') as string
  const card_type    = formData.get('card_type') as string
  const expiry_month = parseInt(formData.get('expiry_month') as string)
  const expiry_year  = parseInt(formData.get('expiry_year') as string)

  try {
    const res = await fetch(`${API}/api/cards/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
      body: JSON.stringify({ last_four, card_type, expiry_month, expiry_year }),
    })
    const data = await res.json()
    if (!res.ok) {
      const msg = data.last_four?.[0] ?? data.detail ?? 'Could not add card.'
      return { error: msg, success: false }
    }
    return { error: null, success: true }
  } catch {
    return { error: 'Could not reach the server.', success: false }
  }
}

export async function blockCardAction(cardId: number): Promise<{ error: string | null }> {
  const tok = await token()
  if (!tok) return { error: 'Not authenticated.' }

  try {
    const res = await fetch(`${API}/api/cards/${cardId}/block/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
    })
    const data = await res.json()
    if (!res.ok) return { error: data.detail ?? 'Could not block card.' }
    return { error: null }
  } catch {
    return { error: 'Could not reach the server.' }
  }
}

export async function markAllReadAction(): Promise<void> {
  const tok = await token()
  if (!tok) return

  await fetch(`${API}/api/notifications/read-all/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
  }).catch(() => null)
}

export async function markNotificationReadAction(id: number): Promise<void> {
  const tok = await token()
  if (!tok) return

  await fetch(`${API}/api/notifications/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
  }).catch(() => null)
}
