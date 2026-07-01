import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; isLoading?: boolean };

const Button = forwardRef<HTMLButtonElement, Props>(({ className, variant = 'primary', isLoading, disabled, children, ...props }, ref) => {
  const variants = {
    primary: 'btn-primary', secondary: 'btn-secondary', ghost: 'btn-ghost',
    danger: 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50',
  };
  return <button ref={ref} className={cn(variants[variant], className)} disabled={disabled || isLoading} {...props}>{isLoading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}{children}</button>;
});
Button.displayName = 'Button';
export default Button;
