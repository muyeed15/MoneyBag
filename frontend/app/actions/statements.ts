'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { API } from './_shared'

export type StatementState = { ok: boolean; message: string }

export async function generateStatementAction(
  _prev: StatementState,
  formData: FormData,
): Promise<StatementState> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return { ok: false, message: 'Not authenticated.' }

  const body = JSON.stringify({
    year: Number(formData.get('year')),
    month: Number(formData.get('month')),
  })

  try {
    const res = await fetch(`${API}/api/statements/generate/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, message: data.detail ?? 'Failed to generate statement.' }
    revalidatePath('/transactions')
    return { ok: true, message: `Statement for ${data.period} generated.` }
  } catch {
    return { ok: false, message: 'Network error. Try again.' }
  }
}
