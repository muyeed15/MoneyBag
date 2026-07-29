'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { API } from './_shared'

export type RemittanceState = { ok: boolean; message: string }

export async function receiveRemittanceAction(
  _prev: RemittanceState,
  formData: FormData,
): Promise<RemittanceState> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return { ok: false, message: 'Not authenticated.' }

  const body = JSON.stringify({
    partner_id: Number(formData.get('partner_id')),
    sender_name: formData.get('sender_name'),
    sender_country: formData.get('sender_country'),
    amount_foreign: Number(formData.get('amount_foreign')),
  })

  try {
    const res = await fetch(`${API}/api/receive-remittance/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, message: data.detail ?? 'Remittance failed.' }
    revalidatePath('/dashboard')
    return { ok: true, message: `Received ৳${data.amount_bdt} from ${data.sender_name}.` }
  } catch {
    return { ok: false, message: 'Network error. Try again.' }
  }
}
