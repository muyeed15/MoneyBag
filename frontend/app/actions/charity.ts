'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { API, token } from './_shared'

export async function calculateZakatAction(_prev: unknown, formData: FormData) {
  const t = await token()
  if (!t) redirect('/login')

  try {
    const res = await fetch(`${API}/api/zakat/calculate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({
        total_wealth: formData.get('total_wealth'),
        nisab_threshold: formData.get('nisab_threshold') || '85000',
      }),
    })
    if (res.status === 401) redirect('/login')
    return await res.json()
  } catch {
    return { error: 'Could not reach server.' }
  }
}

export async function payZakatAction(_prev: unknown, formData: FormData) {
  const t = await token()
  if (!t) redirect('/login')

  try {
    const res = await fetch(`${API}/api/zakat/pay/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({
        amount: formData.get('amount'),
        recipient_id: Number(formData.get('recipient_id')),
      }),
    })
    if (res.status === 401) redirect('/login')
    const data = await res.json()
    if (!res.ok) return { error: data.detail ?? 'Payment failed' }
    revalidatePath('/charity')
    return { success: true, amount: data.amount }
  } catch {
    return { error: 'Could not reach server.' }
  }
}

export async function giveSadaqahAction(_prev: unknown, formData: FormData) {
  const t = await token()
  if (!t) redirect('/login')

  try {
    const res = await fetch(`${API}/api/sadaqah/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({
        amount: formData.get('amount'),
        recipient_id: Number(formData.get('recipient_id')),
        cause: formData.get('cause') || '',
        is_anonymous: formData.get('is_anonymous') === 'true',
      }),
    })
    if (res.status === 401) redirect('/login')
    const data = await res.json()
    if (!res.ok) return { error: data.detail ?? 'Donation failed' }
    revalidatePath('/charity')
    return { success: true, amount: data.amount }
  } catch {
    return { error: 'Could not reach server.' }
  }
}

export async function updateHawlAction(_prev: unknown, formData: FormData) {
  const t = await token()
  if (!t) redirect('/login')

  try {
    const res = await fetch(`${API}/api/hawl/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ current_wealth: formData.get('current_wealth') || '0' }),
    })
    if (res.status === 401) redirect('/login')
    const data = await res.json()
    if (!res.ok) return { error: data.detail ?? 'Update failed' }
    revalidatePath('/charity/hawl')
    return { success: true, ...data }
  } catch {
    return { error: 'Could not reach server.' }
  }
}

export async function renewHawlAction(_prev: unknown, _formData: FormData) {
  const t = await token()
  if (!t) redirect('/login')

  try {
    const res = await fetch(`${API}/api/hawl/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
    })
    if (res.status === 401) redirect('/login')
    const data = await res.json()
    revalidatePath('/charity/hawl')
    return data
  } catch {
    return { error: 'Could not reach server.' }
  }
}

export async function createSadaqahJariyahAction(_prev: unknown, formData: FormData) {
  const t = await token()
  if (!t) redirect('/login')

  try {
    const res = await fetch(`${API}/api/sadaqah-jariyah/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({
        amount: formData.get('amount'),
        recipient_id: Number(formData.get('recipient_id')),
        cause: formData.get('cause') || '',
      }),
    })
    if (res.status === 401) redirect('/login')
    const data = await res.json()
    if (!res.ok) return { error: data.detail ?? 'Creation failed' }
    revalidatePath('/charity')
    return { success: true, ...data }
  } catch {
    return { error: 'Could not reach server.' }
  }
}

export async function toggleSadaqahJariyahAction(donationId: number, isActive: boolean) {
  const t = await token()
  if (!t) redirect('/login')

  try {
    const res = await fetch(`${API}/api/sadaqah-jariyah/${donationId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ is_active: isActive }),
    })
    if (res.status === 401) redirect('/login')
    revalidatePath('/charity')
    return { success: true }
  } catch {
    return { error: 'Could not reach server.' }
  }
}
