import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'navy' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-[10px] min-h-[44px] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variants = {
      primary:
        'bg-[#f78b2d] text-[#1a1204] hover:bg-[#e07316] active:scale-[0.99] border-0',
      secondary:
        'bg-white text-[#0c2f66] border border-[#b9c8e2] hover:bg-[#f4f7fc]',
      navy: 'bg-[#0c3b7c] text-white hover:bg-[#0c2f66] border-0',
      outline:
        'bg-transparent border border-[#9db4dd] text-white hover:bg-white/10',
      ghost:
        'bg-transparent text-[#0b2a5b] hover:bg-black/5 dark:text-white dark:hover:bg-white/10',
      danger:
        'bg-[#fde0e0] text-[#7a1410] border border-[#b3261e] hover:bg-red-200',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs min-h-[36px]',
      md: 'px-5 py-3 text-sm min-h-[44px]',
      lg: 'px-7 py-3.5 text-base min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Yuklanmoqda...
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
