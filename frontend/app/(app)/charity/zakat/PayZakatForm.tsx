"use client"

import { useActionState } from "react"
import { payZakatAction } from "@/app/actions"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { formatAmount } from "@/utils/helpers"
import type { Foundation } from "@/types"

export function PayZakatForm({ foundations }: { foundations: Foundation[] }) {
  const [state, action, pending] = useActionState(payZakatAction, null)

  return (
    <div className="bg-white border border-sage-mid p-5">
      <h2 className="text-navy font-semibold text-sm mb-4">Pay Zakat</h2>
      {state?.success && (
        <div className="mb-4 bg-teal/10 border border-teal/20 px-4 py-3 text-sm text-teal">
          Paid {formatAmount(state.amount)} successfully.
        </div>
      )}
      {state?.error && (
        <div className="mb-4 border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}
      <form action={action} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-navy mb-1">Foundation</label>
          <select
            name="recipient_id"
            required
            className="w-full border border-sage-mid px-3 py-2 text-sm text-navy focus:outline-none focus:border-teal"
          >
            <option value="">Select a foundation</option>
            {foundations.map((f) => (
              <option key={f.id} value={f.user_id}>{f.organization_name} &mdash; {f.cause}</option>
            ))}
          </select>
        </div>
        <Input label="Amount (৳)" name="amount" type="number" step="0.01" min="1" required placeholder="e.g. 2500" />
        <Button type="submit" variant="primary" loading={pending} className="w-full">
          {pending ? "Paying..." : "Pay Zakat"}
        </Button>
      </form>
    </div>
  )
}
