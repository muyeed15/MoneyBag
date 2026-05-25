import { cookies } from 'next/headers'

export const API = process.env.DJANGO_API_URL ?? 'http://localhost:8000'

export async function token(): Promise<string | undefined> {
  return (await cookies()).get('access_token')?.value
}
