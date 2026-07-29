'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { API } from './_shared'

export type BankState = { ok: boolean; message: string }

export async function addMoneyAction(
  _prev: BankState,
  formData: FormData,
): Promise<BankState> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return { ok: false, message: 'Not authenticated.' }

  const body = JSON.stringify({
    bank_account_id: Number(formData.get('bank_account_id')),
    amount: Number(formData.get('amount')),
  })

  try {
    const res = await fetch(`${API}/api/add-money/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, message: data.detail ?? 'Add money failed.' }
    revalidatePath('/dashboard')
    return { ok: true, message: `Added ৳${data.amount} from bank to wallet.` }
  } catch {
    return { ok: false, message: 'Network error. Try again.' }
  }
}

export async function withdrawAction(
  _prev: BankState,
  formData: FormData,
): Promise<BankState> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return { ok: false, message: 'Not authenticated.' }

  const body = JSON.stringify({
    bank_account_id: Number(formData.get('bank_account_id')),
    amount: Number(formData.get('amount')),
  })

  try {
    const res = await fetch(`${API}/api/withdraw/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, message: data.detail ?? 'Withdraw failed.' }
    revalidatePath('/dashboard')
    return { ok: true, message: `Withdrew ৳${data.amount} to bank account.` }
  } catch {
    return { ok: false, message: 'Network error. Try again.' }
  }
}
