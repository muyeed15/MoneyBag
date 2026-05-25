"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, Info, Store } from "lucide-react";
import { merchantPayAction } from "@/app/actions";
import type { Merchant } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/ui/PageTransition";
import { SuccessModal } from "@/components/ui/SuccessModal";

const CATEGORY_LABEL: Record<string, string> = {
  retail: "Retail",
  food: "Food & Beverage",
  transport: "Transport",
  utility: "Utility",
  health: "Health",
  education: "Education",
  entertainment: "Entertainment",
  other: "Other",
};

const initialState = { error: null, success: false };

export default function PayPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Merchant | null>(null);
  const [state, formAction, pending] = useActionState(
    merchantPayAction,
    initialState,
  );

  const { data: merchants = [] } = useSWR<Merchant[]>("/api/merchants");

  const showSuccess = state.success && !!state.amount && !!state.merchant_name;

  return (
    <>
      {showSuccess && (
        <SuccessModal
          amount={state.amount!}
          to={state.merchant_name!}
          label="Payment Successful"
          onClose={() => router.push("/dashboard")}
        />
      )}

      <PageTransition>
        <div className="bg-white border-b border-sage-mid px-4 h-16 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (selected ? setSelected(null) : router.back())}
            aria-label="Go back"
            className="text-navy-muted active:opacity-60 transition-opacity"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div>
            <p className="text-[10px] text-navy-muted font-semibold uppercase tracking-widest leading-none">
              {selected ? selected.business_name : "QR Payment"}
            </p>
            <h1 className="text-navy font-bold text-lg leading-tight">
              {selected ? "Enter Amount" : "Pay Merchant"}
            </h1>
          </div>
        </div>

        <div className="px-4 lg:px-8 py-6 max-w-lg mx-auto">
          {!selected ? (
            <>
              {merchants.length === 0 ? (
                <div className="bg-white border border-sage-mid px-6 py-16 text-center">
                  <Store className="h-10 w-10 text-navy-muted mx-auto mb-3" />
                  <p className="text-navy font-semibold">
                    No verified merchants
                  </p>
                  <p className="text-sm text-navy-muted mt-1">
                    No merchants are available at this time.
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-sage-mid divide-y divide-sage-mid">
                  {merchants.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelected(m)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-sage/30 active:opacity-70 transition-colors"
                    >
                      <div className="h-10 w-10 bg-teal flex items-center justify-center shrink-0">
                        <Store
                          className="h-5 w-5 text-white"
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy">
                          {m.business_name}
                        </p>
                        <p className="text-xs text-navy-muted">
                          {CATEGORY_LABEL[m.category] ?? m.category}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="bg-teal text-white px-4 py-3 mb-5 flex gap-3 items-start">
                <Info className="h-4 w-4 mt-0.5 shrink-0 text-white/70" />
                <p className="text-sm leading-snug">
                  Payments are instant and <strong>cannot be reversed</strong>.
                </p>
              </div>

              {state.error && (
                <div className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 mb-5">
                  {state.error}
                </div>
              )}

              <form
                action={formAction}
                className="bg-white border border-sage-mid"
              >
                <input type="hidden" name="merchant_id" value={selected.id} />
                <input
                  type="hidden"
                  name="merchant_name"
                  value={selected.business_name}
                />

                <div className="divide-y divide-sage-mid">
                  <div className="px-5 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-navy-muted mb-1">
                      Merchant
                    </p>
                    <p className="text-sm font-semibold text-navy">
                      {selected.business_name}
                    </p>
                    <p className="text-xs text-navy-muted">
                      {CATEGORY_LABEL[selected.category] ?? selected.category}
                    </p>
                  </div>
                  <div className="px-5 py-4">
                    <Input
                      label="Amount (৳)"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      placeholder="0.00"
                    />
                    <p className="text-xs text-navy-muted mt-2 flex items-center gap-1">
                      <Info className="h-3 w-3" /> A small fee may apply.
                    </p>
                  </div>
                  <div className="px-5 py-4">
                    <Input
                      label="Note (Optional)"
                      name="note"
                      type="text"
                      placeholder="e.g. Table 4, order #12…"
                    />
                  </div>
                </div>

                <div className="flex border-t border-sage-mid">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="flex-1 py-4 text-sm font-semibold text-navy-muted border-r border-sage-mid active:opacity-60 transition-opacity"
                  >
                    Back
                  </button>
                  <Button
                    type="submit"
                    variant="cta"
                    loading={pending}
                    className="flex-1 rounded-none h-auto py-4 text-base"
                  >
                    {pending ? "Processing…" : "Confirm Payment"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </PageTransition>
    </>
  );
}
