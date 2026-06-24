import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Transaction } from './api'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'danger',
  reversed: 'neutral',
}

export function formatAmount(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return `৳${num.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .join('')
    .slice(0, 2)
}

type TxMeta = {
  label: string
  color: string
  minus: boolean
  direction: 'to' | 'from'
  counterparty: string
}

export function getTxMeta(tx: Transaction, myPhone: string): TxMeta {
  const isSender = tx.sender_phone === myPhone

  switch (tx.transaction_type) {
    case 'send':
      return {
        label: isSender ? 'Send Money' : 'Received',
        color: isSender ? 'text-navy-muted' : 'text-navy',
        minus: isSender,
        direction: isSender ? 'to' : 'from',
        counterparty: isSender ? (tx.receiver_phone ?? '—') : (tx.sender_phone ?? '—'),
      }
    case 'cash_in':
      return {
        label: 'Cash In',
        color: 'text-navy',
        minus: false,
        direction: 'from',
        counterparty: 'Agent',
      }
    case 'cash_out':
      return {
        label: 'Cash Out',
        color: 'text-navy-muted',
        minus: true,
        direction: 'to',
        counterparty: 'Agent',
      }
    case 'payment':
      return {
        label: isSender ? 'QR Payment' : 'Payment Received',
        color: isSender ? 'text-navy-muted' : 'text-navy',
        minus: isSender,
        direction: isSender ? 'to' : 'from',
        // Payer sees the merchant name; merchant sees the payer's phone.
        counterparty: isSender
          ? (tx.merchant_name ?? tx.receiver_phone ?? '—')
          : (tx.sender_phone ?? '—'),
      }
    default:
      return {
        label: tx.transaction_type,
        color: 'text-navy',
        minus: isSender,
        direction: isSender ? 'to' : 'from',
        counterparty: isSender ? (tx.receiver_phone ?? '—') : (tx.sender_phone ?? '—'),
      }
  }
}
