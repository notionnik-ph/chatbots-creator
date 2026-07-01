'use client';

import type { ReactNode } from 'react';
export default function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xl"><div className="flex items-center justify-between gap-4"><h2 className="font-semibold text-text-primary">{title}</h2><button onClick={onClose} className="text-text-muted hover:text-text-primary" aria-label="Close">×</button></div><div className="mt-4">{children}</div></div></div>;
}
