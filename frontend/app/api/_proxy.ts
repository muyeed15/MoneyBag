import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/utils/logger'

const API = (process.env.DJANGO_API_URL ?? 'http://localhost:8000').replace('://0.0.0.0', '://127.0.0.1')
const PAGE_SIZE = process.env.PAGE_SIZE ?? '10'

export function proxyList(backendPath: string) {
  return async function GET(request: NextRequest): Promise<NextResponse> {
    const token = (await cookies()).get('access_token')?.value
    if (!token) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })

    const page = request.nextUrl.searchParams.get('page') ?? '1'
    const url = `${API}${backendPath}?page=${page}&page_size=${PAGE_SIZE}`
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      return NextResponse.json(await res.json(), { status: res.status })
    } catch (err) {
      logger.error('proxy:list', `Backend unreachable`, { path: backendPath, error: err })
      return NextResponse.json({ detail: 'Failed to reach backend.' }, { status: 502 })
    }
  }
}
