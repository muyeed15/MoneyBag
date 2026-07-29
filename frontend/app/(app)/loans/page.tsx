"use client";

import { useActionState, useState } from "react";
import useSWR from "swr";
import { Info } from "lucide-react";
import { applyQardHasanAction, repayQardHasanAction } from "@/app/actions";
import type { QardHasanProduct, QardHasanApplication } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageTransition } from "@/components/ui/PageTransition";

const initialState = { ok: false, message: "" };

const BADGE_COLORS: Record<string, string> = {
  disbursed: "bg-blue-100 text-blue-700",
  repaid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  approved: "bg-teal/10 text-teal",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-gray-100 text-gray-700",
};

export default function LoansPage() {
  const [applyState, applyAction, applyPending] = useActionState(applyQardHasanAction, initialState);
  const [repayState, repayAction, repayPending] = useActionState(repayQardHasanAction, initialState);
  const [tab, setTab] = useState<"apply" | "list">("apply");
  const { data: products } = useSWR<QardHasanProduct[]>("/api/loan-products");
  const { data: loanData } = useSWR<{ results: QardHasanApplication[] }>("/api/loans?page=1");
  const productList = products ?? [];
  const loans = loanData?.results ?? [];
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const feedbackMsg = applyState.message || repayState.message;
  const feedbackOk = applyState.ok || repayState.ok;

  return (
    <PageTransition>
      <PageHeader title="Qard Hasan" subtitle="Interest-Free Loan" showBack />
      <div className="px-4 py-5 lg:px-8 lg:py-8 mx-auto max-w-2xl space-y-5">
        {feedbackOk && feedbackMsg && (
          <div className="bg-teal/10 border border-teal/30 rounded-xl px-4 py-3 text-sm font-medium text-teal">{feedbackMsg}</div>
        )}
        <div className="bg-sage/50 border border-sage-mid rounded-2xl p-4">
          <p className="text-xs leading-snug text-navy-muted">
            Qard Hasan is an interest-free benevolent loan based on Islamic principles. No riba (interest) is charged. You only repay the principal amount. A minimal flat service fee may apply for processing.
          </p>
        </div>
        <div className="flex gap-2">
          {(["apply", "list"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 ${
                tab === t ? "bg-teal text-white shadow-sm" : "bg-sage text-navy-muted hover:bg-sage-mid/20"
              }`}
            >
              {t === "apply" ? "Apply" : `My Loans${loans.length > 0 ? ` (${loans.length})` : ""}`}
            </button>
          ))}
        </div>

        {tab === "apply" && (
          <div className="space-y-5">
            {productList.length === 0 ? (
              <div className="bg-white border border-sage-mid px-6 py-16 text-center rounded-2xl shadow-sm">
                <p className="text-navy font-semibold">No loan products available</p>
                <p className="text-sm text-navy-muted mt-1">Check back later.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3">
                  {productList.map((p) => (
                    <label key={p.id} className={`flex items-start gap-3 border rounded-2xl p-4 cursor-pointer hover:border-teal/50 has-[:checked]:border-teal has-[:checked]:bg-teal/5 transition-all duration-150 ${selectedProduct === p.id ? "border-teal bg-teal/5 shadow-sm" : "border-sage-mid"}`}>
                      <input type="radio" name="product_radio" checked={selectedProduct === p.id} onChange={() => setSelectedProduct(p.id)} className="accent-teal mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-navy">{p.name}</p>
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-700">Halal</span>
                        </div>
                        <p className="text-xs text-navy-muted mt-1">Up to ৳{p.max_amount} &middot; {p.tenure_days}d &middot; Service fee: ৳{p.service_fee}</p>
                        <p className="text-xs text-teal font-medium mt-1">0% Riba (Interest-free)</p>
                      </div>
                    </label>
                  ))}
                </div>
                <form action={applyAction} className="bg-white border border-sage-mid rounded-2xl p-5 shadow-sm space-y-5">
                  <input type="hidden" name="product_id" value={selectedProduct ?? ""} />
                  <Input name="amount" label="Amount (৳)" type="number" placeholder="5000" required />
                  {applyState.message && !applyState.ok && (<div className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 rounded-r">{applyState.message}</div>)}
                  <Button type="submit" loading={applyPending} disabled={!selectedProduct} className="w-full h-auto py-4 text-base rounded-xl">{applyPending ? "Applying..." : "Apply for Qard Hasan"}</Button>
                </form>
              </>
            )}
          </div>
        )}

        {tab === "list" && (
          <div className="space-y-3">
            {loans.length === 0 ? (
              <div className="bg-white border border-sage-mid px-6 py-16 text-center rounded-2xl shadow-sm">
                <p className="text-navy font-semibold">No Qard Hasan loans</p>
                <p className="text-sm text-navy-muted mt-1">Apply for an interest-free loan to get started.</p>
              </div>
            ) : (
              loans.map((loan) => (
                <div key={loan.id} className="bg-white border border-sage-mid rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-navy">{loan.product_name}</p>
                      <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${BADGE_COLORS[loan.status] ?? "bg-gray-100 text-gray-700"}`}>{loan.status}</span>
                    </div>
                    <p className="text-xs text-navy-muted mt-1">Ref: {loan.loan_reference}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-navy-muted"><span className="text-navy font-semibold">৳{loan.amount_paid}</span> paid</span>
                      <span className="text-navy-muted">of <span className="text-navy font-semibold">৳{loan.amount_due}</span></span>
                      {Number(loan.hibah_given) > 0 && (<span className="text-teal font-medium">+৳{loan.hibah_given} hibah</span>)}
                    </div>
                    {loan.due_date && <p className="text-xs text-navy-muted mt-1">Due: {loan.due_date}</p>}
                  </div>
                  {loan.status !== "repaid" && (
                    <div className="border-t border-sage-mid px-5 py-3 bg-sage/50">
                      <form action={repayAction} className="flex items-end gap-3 flex-wrap">
                        <input type="hidden" name="loan_id" value={loan.id} />
                        <div className="flex-1 min-w-0"><Input name="amount" label="Principal" type="number" placeholder="Amount" required /></div>
                        <div className="w-28 shrink-0"><Input name="hibah" label="Hibah" type="number" placeholder="Optional" /></div>
                        <Button type="submit" loading={repayPending} size="sm">Repay</Button>
                      </form>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
