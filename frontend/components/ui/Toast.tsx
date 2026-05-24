"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export type Toast = { id: number; message: string };

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss?: (id: number) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none w-72">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-navy text-white text-sm px-4 py-3 border-l-4 border-orange pointer-events-auto flex items-start gap-3 shadow-lg"
          >
            <span className="flex-1 leading-snug">{t.message}</span>
            {onDismiss && (
              <button
                onClick={() => onDismiss(t.id)}
                className="text-white/50 hover:text-white mt-0.5 shrink-0 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
