import React from 'react';
import { cn } from '@/lib/utils';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'accent' | 'primary' | 'muted' | 'outline';
}

export const Tag: React.FC<TagProps> = ({
  className,
  variant = 'accent',
  children,
  ...props
}) => {
  const variants = {
    accent: 'bg-[#fdebd9] text-[#8a3d00]',
    primary: 'bg-[#0c3b7c] text-white',
    muted: 'bg-[#e8eef7] text-[#4a5f82] dark:bg-[#1f2b40] dark:text-[#9db4dd]',
    outline: 'border border-[#b9c8e2] text-[#0b2a5b] bg-white dark:bg-[#141d2e] dark:text-white',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};
