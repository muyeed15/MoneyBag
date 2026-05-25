'use server'

import { API, token } from './_shared'

export async function markAllReadAction(): Promise<void> {
  const tok = await token()
  if (!tok) return

  await fetch(`${API}/api/notifications/read-all/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
  }).catch(() => null)
}

export async function markNotificationReadAction(id: number): Promise<void> {
  const tok = await token()
  if (!tok) return

  await fetch(`${API}/api/notifications/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
  }).catch(() => null)
}
