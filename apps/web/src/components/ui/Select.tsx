import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[13px] font-medium text-[#0b2a5b] dark:text-[#d5e3ff]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'appearance-none border border-[#b9c8e2] rounded-[10px] px-3.5 py-2.5 pr-10 text-[14px] min-h-[44px] w-full text-[#0b2a5b] bg-white outline-none transition-colors duration-150 cursor-pointer',
              'focus:border-[#0c3b7c] focus:ring-2 focus:ring-[#0c3b7c]/15',
              'dark:bg-[#141d2e] dark:border-[#324466] dark:text-white',
              error && 'border-red-500',
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#4a5f82]">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    );
  },
);

Select.displayName = 'Select';
