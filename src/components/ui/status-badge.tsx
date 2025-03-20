
import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  color: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, color, className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        color,
        className
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
