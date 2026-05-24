import { getMe, getWallet, getTransactions, getNotifications } from '@/lib/api'
import LiveDashboard from './LiveDashboard'

export default async function DashboardPage() {
  const [user, wallet, transactions, notifications] = await Promise.all([
    getMe(),
    getWallet(),
    getTransactions(),
    getNotifications(),
  ])

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <LiveDashboard
        initialUser={user}
        initialWallet={wallet}
        initialTransactions={transactions}
        initialNotifications={notifications}
      />
    </div>
  )
}
