"use client";

import { useActionState, useState } from "react";
import useSWR from "swr";
import { Info } from "lucide-react";
import { rechargeAction } from "@/app/actions";
import type { Operator, DataPack } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageTransition } from "@/components/ui/PageTransition";

const RECHARGE_TYPES = [
  { value: "prepaid", label: "Prepaid" },
  { value: "postpaid", label: "Postpaid" },
  { value: "data_pack", label: "Data Pack" },
];

const initialState = { ok: false, message: "" };

export default function RechargePage() {
  const [state, formAction, pending] = useActionState(rechargeAction, initialState);
  const [rechargeType, setRechargeType] = useState("prepaid");

  const { data: operators } = useSWR<Operator[]>("/api/operators");
  const [selectedOp, setSelectedOp] = useState<number | null>(null);
  const { data: packs } = useSWR<DataPack[]>(
    selectedOp ? `/api/data-packs?operator_id=${selectedOp}` : null,
  );
  const operatorList = operators ?? [];
  const dataPacks = packs ?? [];

  return (
    <PageTransition>
      <PageHeader title="Mobile Recharge" subtitle="Top Up" showBack />

      <div className="px-4 py-5 lg:px-8 lg:py-8 mx-auto max-w-2xl space-y-5">
        {state.ok && (
          <div className="bg-teal/10 border border-teal/30 rounded-xl px-4 py-3 text-sm font-medium text-teal">
            {state.message}
          </div>
        )}

        <form action={formAction} className="bg-white border border-sage-mid rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex gap-2 items-start">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-navy-muted" />
            <p className="text-xs leading-snug text-navy-muted">
              Instant recharge. Amount is deducted from your wallet.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-navy-muted mb-2">
              Operator
            </p>
            <select
              name="operator_id"
              className="w-full border border-sage-mid px-3.5 py-3 text-sm text-navy bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal/10 focus:border-teal transition-all duration-150"
              onChange={(e) => setSelectedOp(Number(e.target.value))}
              required
            >
              <option value="">Select operator</option>
              {operatorList.map((op) => (
                <option key={op.id} value={op.id}>{op.name}</option>
              ))}
            </select>
          </div>

          <Input
            name="phone_number"
            label="Phone Number"
            type="text"
            inputMode="numeric"
            placeholder="01XXXXXXXXX"
            required
          />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-navy-muted mb-2">
              Recharge Type
            </p>
            <div className="flex gap-2">
              {RECHARGE_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setRechargeType(t.value)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 ${
                    rechargeType === t.value
                      ? "bg-teal text-white shadow-sm"
                      : "bg-sage text-navy-muted hover:bg-sage-mid/20"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="recharge_type" value={rechargeType} />
          </div>

          {rechargeType === "data_pack" && dataPacks.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-navy-muted mb-2">
                Data Pack
              </p>
              <div className="space-y-2">
                {dataPacks.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-3 border border-sage-mid rounded-xl p-3 cursor-pointer hover:border-teal/50 has-[:checked]:border-teal has-[:checked]:bg-teal/5 transition-all duration-150"
                  >
                    <input
                      type="radio"
                      name="data_pack_id"
                      value={p.id}
                      className="accent-teal"
                      required
                    />
                    <div>
                      <p className="text-sm font-semibold text-navy">{p.name} ({p.volume})</p>
                      <p className="text-xs text-navy-muted">৳{p.amount} / {p.validity_days}d</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {rechargeType !== "data_pack" && (
            <Input
              name="amount"
              label="Amount (৳)"
              type="number"
              placeholder="100"
              required
            />
          )}

          {state.message && !state.ok && (
            <div className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 rounded-r">
              {state.message}
            </div>
          )}

          <Button type="submit" loading={pending} className="w-full h-auto py-4 text-base rounded-xl">
            {pending ? "Recharging..." : "Recharge Now"}
          </Button>
        </form>
      </div>
    </PageTransition>
  );
}
