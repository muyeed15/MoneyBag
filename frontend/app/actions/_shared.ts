import { cookies } from 'next/headers'
import { API } from '@/utils/config'

export { API }

export async function token(): Promise<string | undefined> {
  return (await cookies()).get('access_token')?.value
}
