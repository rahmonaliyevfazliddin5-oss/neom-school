import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverable = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-[#141d2e] border border-[#e1e8f3] dark:border-[#24324d] rounded-[16px] p-5 flex flex-col gap-3.5 shadow-sm transition-all duration-150',
        hoverable && 'hover:shadow-md hover:border-[#b9c8e2]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
