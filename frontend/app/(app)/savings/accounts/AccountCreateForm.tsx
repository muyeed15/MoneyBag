"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { createMudarabahAccountAction } from "@/app/actions"
import { Button } from "@/components/ui/Button"
import type { MudarabahPlan } from "@/types"

export function AccountCreateForm({ plans }: { plans: MudarabahPlan[] }) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createMudarabahAccountAction, null)

  if (state?.success && state.account_number) {
    router.push(`/savings/accounts/${state.account_number}`)
  }

  return (
    <form action={action} className="bg-white border border-sage-mid p-5">
      <h3 className="text-navy font-semibold text-sm mb-3">Open New Account</h3>
      {state?.error && (
        <div className="mb-3 border-l-4 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <select
        name="plan_id"
        required
        className="w-full border border-sage-mid px-3 py-2 text-sm text-navy mb-3 focus:outline-none focus:border-teal"
      >
        <option value="">Select a plan</option>
        {plans.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} &mdash; ৳{p.monthly_amount}/mo x {p.duration_months}m
          </option>
        ))}
      </select>
      <Button type="submit" variant="primary" size="md" loading={pending} className="w-full">
        {pending ? "Creating..." : "Open Account"}
      </Button>
    </form>
  )
}
