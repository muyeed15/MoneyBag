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
          className="relative bg-white text-navy text-sm px-4 py-3 border border-sage-mid shadow-lg rounded-xl"
        >
          <span className="block leading-snug pr-6">{t.message}</span>
          {onDismiss && (
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss notification"
              className="absolute top-2 right-2 text-navy-muted transition-colors"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
