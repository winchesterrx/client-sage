
import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  color?: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, color, className }) => {
  // Automatically determine color if not provided
  let badgeColor = color;
  
  if (!badgeColor) {
    switch (status.toLowerCase()) {
      // Project statuses
      case 'planning':
        badgeColor = 'bg-blue-100 text-blue-800';
        break;
      case 'in_progress':
        badgeColor = 'bg-yellow-100 text-yellow-800';
        break;
      case 'completed':
        badgeColor = 'bg-green-100 text-green-800';
        break;
      case 'on_hold':
        badgeColor = 'bg-gray-100 text-gray-800';
        break;
        
      // Service statuses
      case 'active':
        badgeColor = 'bg-green-100 text-green-800';
        break;
      case 'inactive':
        badgeColor = 'bg-gray-100 text-gray-800';
        break;
      case 'pending':
        badgeColor = 'bg-yellow-100 text-yellow-800';
        break;
        
      // Payment statuses
      case 'paid':
        badgeColor = 'bg-green-100 text-green-800';
        break;
      case 'overdue':
        badgeColor = 'bg-red-100 text-red-800';
        break;
        
      // Task statuses
      case 'todo':
        badgeColor = 'bg-blue-100 text-blue-800';
        break;
        
      // Default
      default:
        badgeColor = 'bg-gray-100 text-gray-800';
        break;
    }
  }
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        badgeColor,
        className
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
