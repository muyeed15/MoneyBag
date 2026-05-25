"use client";

import { X } from "lucide-react";

export type Toast = { id: number; message: string };

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss?: (id: number) => void;
}): React.ReactElement {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-72">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-navy text-white text-sm px-4 py-3 border-l-4 border-orange flex items-start gap-3 shadow-lg"
        >
          <span className="flex-1 leading-snug">{t.message}</span>
          {onDismiss && (
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss notification"
              className="text-white/50 hover:text-white mt-0.5 shrink-0 transition-colors"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
