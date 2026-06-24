import Link from "next/link"
import { getMudarabahPlans } from "@/utils/api"
import { formatAmount } from "@/utils/helpers"
import { Landmark } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SavingsPage() {
  const plans = await getMudarabahPlans()

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">
      <div className="bg-white border-b border-sage-mid px-6 -mx-4 lg:-mx-8 -mt-6 mb-6 py-4 lg:px-8">
        <h1 className="text-navy font-bold text-lg">Savings</h1>
        <p className="text-navy-muted text-sm">Mudarabah savings plans</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-navy font-semibold">Available Plans</h2>
          <Link href="/savings/accounts" className="text-teal text-sm font-medium hover:underline">
            My Accounts
          </Link>
        </div>

        {plans.length === 0 ? (
          <div className="bg-white border border-sage-mid px-6 py-10 text-center">
            <Landmark className="h-8 w-8 mx-auto text-sage-mid mb-3" />
            <p className="text-navy-muted text-sm">No savings plans available.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white border border-sage-mid">
                <div className="p-5">
                  <h3 className="text-navy font-bold text-base">{plan.name}</h3>
                  <p className="text-navy-muted text-sm mt-1">
                    {plan.duration_months} months &middot; {formatAmount(plan.monthly_amount)}/mo
                  </p>
                  <p className="text-teal text-xs mt-1">
                    Profit ratio: {plan.profit_ratio}%
                  </p>
                </div>
                <div className="border-t border-sage-mid px-5 py-3">
                  <form action="/savings/accounts" method="POST" className="inline">
                    <input type="hidden" name="plan_id" value={plan.id} />
                    <button
                      type="submit"
                      className="bg-teal text-white text-sm font-semibold px-4 py-2 w-full hover:bg-teal/90"
                    >
                      Start Saving
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
