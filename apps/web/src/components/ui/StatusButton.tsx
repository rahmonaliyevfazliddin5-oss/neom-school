import React from 'react';
import { cn } from '@/lib/utils';
import { AttendanceStatus } from '@neom/shared';

export interface StatusButtonProps {
  status: AttendanceStatus;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusButton: React.FC<StatusButtonProps> = ({
  status,
  active = true,
  onClick,
  disabled = false,
  className,
  size = 'md',
}) => {
  const styles: Record<
    AttendanceStatus,
    { label: string; activeClass: string; inactiveClass: string }
  > = {
    [AttendanceStatus.KELDI]: {
      label: 'Keldi',
      activeClass:
        'bg-[#d9f3e1] text-[#0d4a22] border-[#1c7a3c] font-semibold hover:bg-[#c6ebd0]',
      inactiveClass:
        'bg-white text-[#4a5f82] border-[#b9c8e2] hover:bg-[#d9f3e1]/40',
    },
    [AttendanceStatus.KELMADI]: {
      label: 'Kelmadi',
      activeClass:
        'bg-[#fde0e0] text-[#7a1410] border-[#b3261e] font-semibold hover:bg-[#fad0d0]',
      inactiveClass:
        'bg-white text-[#4a5f82] border-[#b9c8e2] hover:bg-[#fde0e0]/40',
    },
    [AttendanceStatus.SABABLI]: {
      label: 'Sababli',
      activeClass:
        'bg-[#dbe9ff] text-[#0c3b7c] border-[#1f5fc4] font-semibold hover:bg-[#c9ddff]',
      inactiveClass:
        'bg-white text-[#4a5f82] border-[#b9c8e2] hover:bg-[#dbe9ff]/40',
    },
    [AttendanceStatus.KECHIKDI]: {
      label: 'Kechikdi',
      activeClass:
        'bg-[#fff3c2] text-[#5c4400] border-[#a67c00] font-semibold hover:bg-[#faeaaf]',
      inactiveClass:
        'bg-white text-[#4a5f82] border-[#b9c8e2] hover:bg-[#fff3c2]/40',
    },
  };

  const current = styles[status];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'border rounded-[8px] transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'md' ? 'min-h-[44px] px-3.5 py-2 text-[13px]' : 'px-2.5 py-1 text-xs',
        active ? current.activeClass : current.inactiveClass,
        className,
      )}
    >
      {current.label}
    </button>
  );
};
