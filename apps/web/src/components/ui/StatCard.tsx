import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  valueColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  valueColor = 'text-[#0c3b7c] dark:text-[#d5e3ff]',
  className,
}) => {
  return (
    <Card className={cn('gap-1', className)}>
      <span className="text-[13px] text-[#4a5f82] dark:text-[#9db4dd] font-medium">
        {label}
      </span>
      <span className={cn('text-[30px] font-bold tracking-tight', valueColor)}>
        {value}
      </span>
      {subtext && (
        <span className="text-xs text-[#4a5f82] dark:text-[#9db4dd] mt-1">
          {subtext}
        </span>
      )}
    </Card>
  );
};
