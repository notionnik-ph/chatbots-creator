import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Props = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string };
const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className, ...props }, ref) => <label className="block"><span className="label">{label}</span><input ref={ref} className={cn('input', error && 'border-red-500/50', className)} {...props}/>{error && <span className="text-xs text-red-300 mt-1 block">{error}</span>}</label>);
Input.displayName = 'Input';
export default Input;
