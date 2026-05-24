"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatAmount } from "@/lib/utils";

interface SuccessModalProps {
  amount: string;
  receiverPhone: string;
  onClose: () => void;
}

export function SuccessModal({
  amount,
  receiverPhone,
  onClose,
}: SuccessModalProps) {
  const router = useRouter();

  function handleDone() {
    onClose();
    router.push("/dashboard");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-navy/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        className="bg-white w-full max-w-sm overflow-hidden"
      >
        {/* Teal top bar */}
        <div className="bg-teal px-6 py-8 text-center">
          <CheckCircle
            className="h-14 w-14 text-white mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">
            Transfer Successful
          </p>
          <p className="text-white text-4xl font-bold tabular-nums mt-2">
            {formatAmount(amount)}
          </p>
        </div>

        {/* Details */}
        <div className="divide-y divide-sage-mid">
          <div className="flex px-6 py-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-navy-muted w-28 shrink-0 mt-0.5">
              Sent To
            </span>
            <span className="text-sm font-semibold text-navy">
              {receiverPhone}
            </span>
          </div>
          <div className="flex px-6 py-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-navy-muted w-28 shrink-0 mt-0.5">
              Status
            </span>
            <span className="text-sm font-semibold text-emerald-600">
              Completed
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="px-6 py-5">
          <Button
            variant="cta"
            size="lg"
            className="w-full"
            onClick={handleDone}
          >
            Done
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
