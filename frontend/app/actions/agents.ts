'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { API } from './_shared'

export type AgentState = { ok: boolean; message: string }

export async function cashInAction(
  _prev: AgentState,
  formData: FormData,
): Promise<AgentState> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return { ok: false, message: 'Not authenticated.' }

  const body = JSON.stringify({
    agent_id: Number(formData.get('agent_id')),
    amount: Number(formData.get('amount')),
    otp: formData.get('otp') ?? '',
  })

  try {
    const res = await fetch(`${API}/api/cash-in/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, message: data.detail ?? 'Cash-in failed.' }
    revalidatePath('/agents')
    revalidatePath('/dashboard')
    return { ok: true, message: `Successfully added ৳${data.amount} to wallet.` }
  } catch {
    return { ok: false, message: 'Network error. Try again.' }
  }
}

export async function cashOutAction(
  _prev: AgentState,
  formData: FormData,
): Promise<AgentState> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return { ok: false, message: 'Not authenticated.' }

  const body = JSON.stringify({
    agent_id: Number(formData.get('agent_id')),
    amount: Number(formData.get('amount')),
    otp: formData.get('otp') ?? '',
  })

  try {
    const res = await fetch(`${API}/api/cash-out/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, message: data.detail ?? 'Cash-out failed.' }
    revalidatePath('/agents')
    revalidatePath('/dashboard')
    return { ok: true, message: `Successfully withdrawn ৳${data.amount}.` }
  } catch {
    return { ok: false, message: 'Network error. Try again.' }
  }
}
