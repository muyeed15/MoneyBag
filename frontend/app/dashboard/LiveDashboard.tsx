'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { User, Wallet, Transaction, Notification } from '@/lib/api'
import {
  fetchWalletAction,
  fetchTransactionsAction,
  fetchNotificationsAction,
  logoutAction,
} from '@/app/actions'
import SendMoneyModal from './SendMoneyModal'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatAmount(amount: string) {
  return '৳ ' + parseFloat(amount).toLocaleString('en-BD', { minimumFractionDigits: 2 })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-BD', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const TX_TYPE_LABEL: Record<Transaction['type'], string> = {
  send: 'Send', receive: 'Receive', cash_in: 'Cash In', cash_out: 'Cash Out', payment: 'Payment',
}

const TX_STATUS_COLOR: Record<Transaction['status'], string> = {
  pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  failed:    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  reversed:  'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Toast = { id: number; message: string }

type Props = {
  initialUser: User
  initialWallet: Wallet
  initialTransactions: Transaction[]
  initialNotifications: Notification[]
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LiveDashboard({
  initialUser,
  initialWallet,
  initialTransactions,
  initialNotifications,
}: Props) {
  const [wallet, setWallet] = useState(initialWallet)
  const [transactions, setTransactions] = useState(initialTransactions)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [showModal, setShowModal] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Track which notification IDs have already been seen so we only toast new ones.
  const seenIds = useRef(new Set(initialNotifications.map((n) => n.id)))

  const addToast = useCallback((message: string) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000)
  }, [])

  const refresh = useCallback(async () => {
    const [newWallet, newTxs, newNotifs] = await Promise.all([
      fetchWalletAction(),
      fetchTransactionsAction(),
      fetchNotificationsAction(),
    ])

    setWallet(newWallet)
    setTransactions(newTxs)

    const fresh = newNotifs.filter((n) => !seenIds.current.has(n.id))
    fresh.forEach((n) => {
      seenIds.current.add(n.id)
      addToast(n.message)
    })
    setNotifications(newNotifs)
  }, [addToast])

  // Poll every 5 seconds.
  useEffect(() => {
    const id = setInterval(refresh, 5000)
    return () => clearInterval(id)
  }, [refresh])

  const unread = notifications.filter((n) => !n.is_read).length

  return (
    <>
      {/* ── Toast stack ─────────────────────────────────────────────────── */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200 pointer-events-auto"
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Send money modal ─────────────────────────────────────────────── */}
      {showModal && (
        <SendMoneyModal
          onClose={() => setShowModal(false)}
          onSuccess={refresh}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          MoneyBag
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{initialUser.phone}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">

        {/* Profile + Wallet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Profile card (static) */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">Profile</p>
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{initialUser.full_name}</p>
            <div className="space-y-1 text-sm text-zinc-500 dark:text-zinc-400">
              <p>Phone: <span className="text-zinc-700 dark:text-zinc-300">{initialUser.phone}</span></p>
              <p>NID: <span className="text-zinc-700 dark:text-zinc-300">{initialUser.nid}</span></p>
              <p>Member since: <span className="text-zinc-700 dark:text-zinc-300">{formatDate(initialUser.created_at)}</span></p>
            </div>
            <div className="flex gap-2 pt-1">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${initialUser.is_verified ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'}`}>
                {initialUser.is_verified ? 'Verified' : 'Unverified'}
              </span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${initialUser.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                {initialUser.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Wallet card (live) */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">Wallet</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{formatAmount(wallet.balance)}</p>
            <div className="space-y-1 text-sm text-zinc-500 dark:text-zinc-400">
              <p>Daily limit: <span className="text-zinc-700 dark:text-zinc-300">{formatAmount(wallet.daily_limit)}</span></p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${wallet.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                {wallet.status.charAt(0).toUpperCase() + wallet.status.slice(1)}
              </span>
              <button
                onClick={() => setShowModal(true)}
                disabled={wallet.status !== 'active'}
                className="rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-2 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Send Money
              </button>
            </div>
          </div>
        </div>

        {/* Transactions + Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Transactions (live) */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Transactions
                <span className="ml-2 text-xs font-normal text-zinc-400">({transactions.length})</span>
              </p>
            </div>
            {transactions.length === 0 ? (
              <p className="px-6 py-8 text-sm text-center text-zinc-400">No transactions yet.</p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {transactions.map((tx) => (
                  <div key={tx.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {TX_TYPE_LABEL[tx.type]}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TX_STATUS_COLOR[tx.status]}`}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-400 truncate">
                        {tx.sender_phone} → {tx.receiver_phone}
                      </p>
                      <p className="text-xs text-zinc-400">{formatDate(tx.created_at)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{formatAmount(tx.amount)}</p>
                      {parseFloat(tx.fee) > 0 && (
                        <p className="text-xs text-zinc-400">Fee: {formatAmount(tx.fee)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications (live) */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Notifications</p>
              {unread > 0 && (
                <span className="inline-flex items-center rounded-full bg-zinc-900 dark:bg-zinc-50 px-2 py-0.5 text-xs font-medium text-white dark:text-zinc-900">
                  {unread} new
                </span>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="px-6 py-8 text-sm text-center text-zinc-400">No notifications.</p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-6 py-4 ${!n.is_read ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''}`}
                  >
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{n.message}</p>
                    <p className="mt-1 text-xs text-zinc-400">{formatDate(n.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  )
}
