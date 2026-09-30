import { ReactNode } from 'react';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--bg-surface-3)] text-[var(--text-secondary)] border-[var(--border-default)]',
  success:
    'bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)] border-[var(--accent-emerald)]/20',
  warning:
    'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] border-[var(--accent-amber)]/20',
  danger:
    'bg-[var(--accent-red)]/10 text-[var(--accent-red)] border-[var(--accent-red)]/20',
  info:
    'bg-[var(--severity-low)]/10 text-[var(--severity-low)] border-[var(--severity-low)]/20',
  critical:
    'bg-[var(--severity-critical)]/10 text-[var(--severity-critical)] border-[var(--severity-critical)]/20',
  high:
    'bg-[var(--severity-high)]/10 text-[var(--severity-high)] border-[var(--severity-high)]/20',
  medium:
    'bg-[var(--severity-medium)]/10 text-[var(--severity-medium)] border-[var(--severity-medium)]/20',
  low:
    'bg-[var(--severity-low)]/10 text-[var(--severity-low)] border-[var(--severity-low)]/20',
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-[11px]',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[3px] border font-medium uppercase tracking-wide ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current pulse-dot" />
      )}
      {children}
    </span>
  );
}
