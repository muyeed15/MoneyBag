import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const DJANGO = 'http://localhost:8000'

export async function GET() {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })

  const res = await fetch(`${DJANGO}/api/notifications/`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
