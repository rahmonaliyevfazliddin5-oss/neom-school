import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-[13px] font-medium text-[#0b2a5b] dark:text-[#d5e3ff]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'border border-[#b9c8e2] rounded-[10px] p-3 text-[14px] min-h-[90px] w-full text-[#0b2a5b] bg-white outline-none transition-colors duration-150',
            'focus:border-[#0c3b7c] focus:ring-2 focus:ring-[#0c3b7c]/15',
            'dark:bg-[#141d2e] dark:border-[#324466] dark:text-white',
            error && 'border-red-500',
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
