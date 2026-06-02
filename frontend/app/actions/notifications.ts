'use server'

import { API, token } from './_shared'

export async function markAllReadAction(): Promise<void> {
  const tok = await token()
  if (!tok) return

  const res = await fetch(`${API}/api/notifications/read-all/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
  })
  if (!res.ok) throw new Error('Failed to mark all as read')
}

export async function markNotificationReadAction(id: number): Promise<void> {
  const tok = await token()
  if (!tok) return

  const res = await fetch(`${API}/api/notifications/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
  })
  if (!res.ok) throw new Error('Failed to mark notification as read')
}
