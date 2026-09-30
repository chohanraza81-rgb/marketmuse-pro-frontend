import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// BUTTON COMPONENT — MusePRO Design System
// ═══════════════════════════════════════════════════════════════

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success';

type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

// ═══════════════════════════════════════════════════════════════
// VARIANT STYLES
// ═══════════════════════════════════════════════════════════════
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-50',
  secondary:
    'bg-[var(--bg-surface-2)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-surface-3)] disabled:opacity-50',
  outline:
    'bg-transparent text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-surface-1)] hover:border-[var(--border-strong)] disabled:opacity-50',
  ghost:
    'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-1)] hover:text-[var(--text-primary)] disabled:opacity-50',
  danger:
    'bg-[var(--accent-red)] text-white hover:opacity-90 disabled:opacity-50',
  success:
    'bg-[var(--accent-emerald)] text-white hover:opacity-90 disabled:opacity-50',
};

// ═══════════════════════════════════════════════════════════════
// SIZE STYLES
// ═══════════════════════════════════════════════════════════════
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-[12px] gap-1.5',
  md: 'px-3.5 py-2 text-[13px] gap-2',
  lg: 'px-5 py-2.5 text-[14px] gap-2',
  icon: 'h-9 w-9 p-0',
  'icon-sm': 'h-7 w-7 p-0',
};

// ═══════════════════════════════════════════════════════════════
// BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading,
      icon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center rounded-[4px] font-medium tracking-tight transition-all ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════
export type { ButtonProps, ButtonVariant, ButtonSize };
export default Button;
