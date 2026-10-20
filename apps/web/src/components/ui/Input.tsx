import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-[#0b2a5b] dark:text-[#d5e3ff]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'border border-[#b9c8e2] rounded-[10px] px-3.5 py-2.5 text-[14px] min-h-[44px] w-full text-[#0b2a5b] bg-white outline-none transition-colors duration-150',
            'focus:border-[#0c3b7c] focus:ring-2 focus:ring-[#0c3b7c]/15',
            'dark:bg-[#141d2e] dark:border-[#324466] dark:text-white',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/15',
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-600 mt-0.5">{error}</span>}
        {helperText && !error && (
          <span className="text-xs text-[#4a5f82] dark:text-[#9db4dd]">{helperText}</span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
