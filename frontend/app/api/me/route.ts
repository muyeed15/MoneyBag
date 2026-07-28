import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const API = (process.env.DJANGO_API_URL ?? 'http://localhost:8003').replace('://0.0.0.0', '://127.0.0.1')

export async function GET(): Promise<NextResponse> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })

  const res = await fetch(`${API}/api/me/`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  return NextResponse.json(await res.json(), { status: res.status })
}
