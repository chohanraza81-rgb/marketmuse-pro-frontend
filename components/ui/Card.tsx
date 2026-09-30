import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

const variantStyles = {
  default: 'bg-[var(--bg-surface-1)] border border-[var(--border-subtle)]',
  elevated: 'bg-[var(--bg-surface-2)] border border-[var(--border-default)]',
  outlined: 'bg-transparent border border-[var(--border-default)]',
};

export function Card({
  children,
  className = '',
  padding = 'md',
  variant = 'default',
}: CardProps) {
  return (
    <div
      className={`rounded-[6px] ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, icon, action }: CardHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-[4px] bg-[var(--bg-surface-3)] text-[var(--text-secondary)]">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-[14px] font-medium text-[var(--text-primary)]">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-[12px] text-[var(--text-secondary)]">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
