import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value: number; // 0 - 100
  max?: number;
  className?: string;
  fillClassName?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  fillClassName,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={cn(
        'h-[10px] w-full rounded-[9px] bg-[#e8eef7] dark:bg-[#1f2b40] overflow-hidden',
        className,
      )}
    >
      <div
        className={cn(
          'h-full rounded-[9px] bg-[#0c3b7c] transition-all duration-300',
          fillClassName,
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
