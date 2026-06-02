import { cookies } from 'next/headers'

export const API = (process.env.DJANGO_API_URL ?? 'http://localhost:8000').replace('://0.0.0.0', '://127.0.0.1')

export async function token(): Promise<string | undefined> {
  return (await cookies()).get('access_token')?.value
}
