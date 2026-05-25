'use server'

import { API, token } from './_shared'

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
