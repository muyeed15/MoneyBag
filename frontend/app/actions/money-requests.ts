'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { API } from './_shared'

export type MoneyRequestState = { ok: boolean; message: string }

export async function createMoneyRequestAction(
  _prev: MoneyRequestState,
  formData: FormData,
): Promise<MoneyRequestState> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return { ok: false, message: 'Not authenticated.' }

  const body = JSON.stringify({
    phone: formData.get('phone'),
    amount: Number(formData.get('amount')),
    note: formData.get('note') ?? '',
  })

  try {
    const res = await fetch(`${API}/api/money-requests/create/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, message: data.detail ?? 'Request failed.' }
    revalidatePath('/send')
    return { ok: true, message: `Requested ৳${data.amount} from ${formData.get('phone')}.` }
  } catch {
    return { ok: false, message: 'Network error. Try again.' }
  }
}

export async function respondMoneyRequestAction(
  _prev: MoneyRequestState,
  formData: FormData,
): Promise<MoneyRequestState> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return { ok: false, message: 'Not authenticated.' }

  const requestId = Number(formData.get('request_id'))
  const body = JSON.stringify({ action: formData.get('action') })

  try {
    const res = await fetch(`${API}/api/money-requests/${requestId}/respond/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, message: data.detail ?? 'Response failed.' }
    revalidatePath('/dashboard')
    return { ok: true, message: `Request ${formData.get('action')}ed.` }
  } catch {
    return { ok: false, message: 'Network error. Try again.' }
  }
}
