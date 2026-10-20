import React from 'react';
import { cn } from '@/lib/utils';

export const TableRow: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3 py-3 border-t border-[#e8eef7] dark:border-[#24324d] text-sm text-[#0b2a5b] dark:text-[#f0f4fc]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
