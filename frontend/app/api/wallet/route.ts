import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { logger } from '@/utils/logger'

const API = (process.env.DJANGO_API_URL ?? 'http://localhost:8003').replace('://0.0.0.0', '://127.0.0.1')

export async function GET(): Promise<NextResponse> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })

  try {
    const res = await fetch(`${API}/api/wallet/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    logger.error('proxy:wallet', 'Backend unreachable', { error: err })
    return NextResponse.json({ detail: 'Failed to reach backend.' }, { status: 502 })
  }
}
