'use server'

import { API, token } from './_shared'

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
  const expiry_month = parseInt(formData.get('expiry_month') as string, 10)
  const expiry_year  = parseInt(formData.get('expiry_year') as string, 10)

  if (isNaN(expiry_month) || isNaN(expiry_year)) {
    return { error: 'Invalid expiry date.', success: false }
  }

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

export async function unblockCardAction(cardId: number): Promise<{ error: string | null }> {
  const tok = await token()
  if (!tok) return { error: 'Not authenticated.' }

  try {
    const res = await fetch(`${API}/api/cards/${cardId}/unblock/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
    })
    const data = await res.json()
    if (!res.ok) return { error: data.detail ?? 'Could not unblock card.' }
    return { error: null }
  } catch {
    return { error: 'Could not reach the server.' }
  }
}
