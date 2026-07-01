import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
export default function Badge({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) { return <span className={cn('inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs text-text-secondary', className)} {...props}>{children}</span>; }
