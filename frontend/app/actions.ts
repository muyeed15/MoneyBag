'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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
