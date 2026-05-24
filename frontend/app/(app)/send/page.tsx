"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Info } from "lucide-react";
import { transferAction } from "@/app/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/ui/PageTransition";
import { SuccessModal } from "@/components/ui/SuccessModal";

const initialState = {
  error: null,
  success: false,
  amount: undefined,
  receiver_phone: undefined,
};

export default function SendPage() {
  const [state, action, pending] = useActionState(transferAction, initialState);
  const router = useRouter();

  const showSuccess = state.success && !!state.amount && !!state.receiver_phone;

  return (
    <>
      {/* Success modal */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessModal
            amount={state.amount!}
            receiverPhone={state.receiver_phone!}
            onClose={() => router.push("/dashboard")}
          />
        )}
      </AnimatePresence>

      <PageTransition>
        {/* Header */}
        <div className="bg-white border-b border-sage-mid px-4 h-16 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-navy-muted active:opacity-60 transition-opacity"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-[10px] text-navy-muted font-semibold uppercase tracking-widest leading-none">
              Transfer
            </p>
            <h1 className="text-navy font-bold text-lg leading-tight">
              Send Money
            </h1>
          </div>
        </div>

        <div className="px-4 lg:px-8 py-6 max-w-lg mx-auto">
          {/* Notice */}
          <div className="bg-teal text-white px-4 py-3 mb-5 flex gap-3 items-start">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-white/70" />
            <p className="text-sm leading-snug">
              Transfers are instant and <strong>cannot be reversed</strong>.
              Verify the number before sending.
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {state.error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 mb-5 overflow-hidden"
              >
                {state.error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form action={action} className="bg-white border border-sage-mid">
            <div className="divide-y divide-sage-mid">
              <div className="px-5 py-4">
                <Input
                  label="Recipient Phone Number"
                  name="receiver_phone"
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  autoComplete="off"
                />
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
                  <Info className="h-3 w-3" /> A small fee may apply for this
                  transfer.
                </p>
              </div>
              <div className="px-5 py-4">
                <Input
                  label="Note (Optional)"
                  name="note"
                  type="text"
                  placeholder="e.g. House rent, groceries…"
                />
              </div>
            </div>

            <div className="flex border-t border-sage-mid">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-4 text-sm font-semibold text-navy-muted border-r border-sage-mid active:opacity-60 transition-opacity"
              >
                Cancel
              </button>
              <Button
                type="submit"
                variant="cta"
                loading={pending}
                className="flex-1 rounded-none h-auto py-4 text-base"
              >
                {pending ? "Sending…" : "Confirm & Send"}
              </Button>
            </div>
          </form>
        </div>
      </PageTransition>
    </>
  );
}
