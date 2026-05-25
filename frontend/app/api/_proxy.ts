import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API = process.env.DJANGO_API_URL ?? 'http://localhost:8000'
const PAGE_SIZE = process.env.PAGE_SIZE ?? '10'

export function proxyList(backendPath: string) {
  return async function GET(request: NextRequest): Promise<NextResponse> {
    const token = (await cookies()).get('access_token')?.value
    if (!token) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })

    const page = request.nextUrl.searchParams.get('page') ?? '1'
    try {
      const res = await fetch(
        `${API}${backendPath}?page=${page}&page_size=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
      )
      return NextResponse.json(await res.json(), { status: res.status })
    } catch {
      return NextResponse.json({ detail: 'Failed to reach backend.' }, { status: 502 })
    }
  }
}
