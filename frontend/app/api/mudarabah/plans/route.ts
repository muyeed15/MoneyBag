import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { logger } from '@/utils/logger'

const API = (process.env.DJANGO_API_URL ?? 'http://localhost:8003').replace('://0.0.0.0', '://127.0.0.1')

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  try {
    const res = await fetch(`${API}/api/mudarabah/plans/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    return NextResponse.json(await res.json(), { status: res.status })
  } catch (err) {
    logger.error('proxy:mudarabah-plans', 'Backend unreachable', err)
    return NextResponse.json({ detail: 'Failed to reach backend.' }, { status: 502 })
  }
}
