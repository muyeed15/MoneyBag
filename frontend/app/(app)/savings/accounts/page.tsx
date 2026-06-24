import Link from "next/link"
import { getMudarabahAccounts, getMudarabahPlans } from "@/utils/api"
import { formatAmount, formatDate } from "@/utils/helpers"
import { Badge } from "@/components/ui/Badge"
import { AccountCreateForm } from "./AccountCreateForm"

export const dynamic = "force-dynamic"

export default async function SavingsAccountsPage() {
  const [accounts, plans] = await Promise.all([
    getMudarabahAccounts(1).catch(() => []),
    getMudarabahPlans().catch(() => []),
  ])

  const accountList = Array.isArray(accounts) ? accounts : []

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">
      <div className="bg-white border-b border-sage-mid px-6 -mx-4 lg:-mx-8 -mt-6 mb-6 py-4 lg:px-8 flex items-center justify-between">
        <div>
          <Link href="/savings" className="text-navy-muted text-sm hover:underline">&larr; Plans</Link>
          <h1 className="text-navy font-bold text-lg">My Savings Accounts</h1>
        </div>
      </div>

      <div className="space-y-4">
        {accountList.length === 0 ? (
          <div className="bg-white border border-sage-mid px-6 py-10 text-center">
            <p className="text-navy-muted text-sm mb-4">No savings accounts yet.</p>
            <AccountCreateForm plans={plans} />
          </div>
        ) : (
          <>
            {accountList.map((acc) => (
              <Link
                key={acc.account_number}
                href={`/savings/accounts/${acc.account_number}`}
                className="block bg-white border border-sage-mid hover:border-teal transition-colors"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-navy font-bold text-sm">{acc.account_number}</span>
                    <Badge variant={acc.status === "active" ? "success" : acc.status === "matured" ? "warning" : "neutral"}>
                      {acc.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-navy">{acc.plan_details?.name}</p>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-navy-muted">Deposited: {formatAmount(acc.total_deposited)}</span>
                    <span className="text-teal font-medium">Payout: {formatAmount(acc.expected_payout)}</span>
                  </div>
                  <p className="text-xs text-navy-muted mt-1">
                    Matures: {formatDate(acc.maturity_date)}
                  </p>
                </div>
              </Link>
            ))}
            <AccountCreateForm plans={plans} />
          </>
        )}
      </div>
    </div>
  )
}
