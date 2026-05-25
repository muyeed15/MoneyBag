import type { SWRConfiguration } from 'swr'

export const SWR_CONFIG: SWRConfiguration = {
  refreshInterval: parseInt(process.env.NEXT_PUBLIC_SWR_REFRESH_INTERVAL ?? '30000'),
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
}

export const TOAST_DURATION_MS = parseInt(process.env.NEXT_PUBLIC_TOAST_DURATION_MS ?? '6000')

export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}
