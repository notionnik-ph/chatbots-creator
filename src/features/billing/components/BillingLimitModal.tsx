"use client";

import { AlertTriangle, X } from "lucide-react";

export default function BillingLimitModal({
  open,
  title = "Free plan limit reached",
  message,
  onClose,
}: {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <AlertTriangle size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {message}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="rounded-lg p-1 text-text-muted hover:bg-surface hover:text-text-primary"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="btn-primary px-5 py-2"
            onClick={onClose}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}