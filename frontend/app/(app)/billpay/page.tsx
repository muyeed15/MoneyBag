"use client";

import { useActionState } from "react";
import useSWR from "swr";
import { Info } from "lucide-react";
import { payBillAction } from "@/app/actions";
import type { Biller } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageTransition } from "@/components/ui/PageTransition";

const initialState = { ok: false, message: "" };

export default function BillPayPage() {
  const [state, formAction, pending] = useActionState(payBillAction, initialState);
  const { data: billers } = useSWR<Biller[]>("/api/billers");
  const billerList = billers ?? [];
  const categories = [...new Set(billerList.map((b) => b.category))];

  return (
    <PageTransition>
      <PageHeader title="Pay Bills" subtitle="Utilities" showBack />
      <div className="px-4 py-5 lg:px-8 lg:py-8 mx-auto max-w-2xl space-y-5">
        {state.ok && (
          <div className="bg-teal/10 border border-teal/30 rounded-xl px-4 py-3 text-sm font-medium text-teal">{state.message}</div>
        )}
        <form action={formAction} className="bg-white border border-sage-mid rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex gap-2 items-start">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-navy-muted" />
            <p className="text-xs leading-snug text-navy-muted">Bill payment is instant. Amount is deducted from your wallet.</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-navy-muted mb-2">Biller</p>
            <select name="biller_id" className="w-full border border-sage-mid px-3.5 py-3 text-sm text-navy bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal/10 focus:border-teal transition-all duration-150" required>
              <option value="">Select biller</option>
              {categories.map((cat) => (
                <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                  {billerList.filter((b) => b.category === cat).map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
                </optgroup>
              ))}
            </select>
          </div>
          <Input name="account_number" label="Account Number" type="text" placeholder="Enter account or meter number" required />
          <Input name="bill_number" label="Bill Number" type="text" placeholder="Optional" />
          <Input name="amount" label="Amount (৳)" type="number" placeholder="500" required />
          <Input name="bill_month" label="Bill Month" type="text" placeholder="e.g. 01/2026" />
          {state.message && !state.ok && (<div className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 rounded-r">{state.message}</div>)}
          <Button type="submit" loading={pending} className="w-full h-auto py-4 text-base rounded-xl">{pending ? "Processing..." : "Pay Bill"}</Button>
        </form>
      </div>
    </PageTransition>
  );
}
