
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  variant?: 'default' | 'whatsapp';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  onClick?: () => void;
}

const FloatingActionButton = ({
  icon = <MessageCircle />,
  variant = 'default',
  position = 'bottom-right',
  onClick,
  className,
  ...props
}: FloatingActionButtonProps) => {
  const positionClasses = {
    'bottom-right': 'right-6 bottom-6',
    'bottom-left': 'left-6 bottom-6',
    'top-right': 'right-6 top-6',
    'top-left': 'left-6 top-6',
  };

  const variantClasses = {
    default: 'bg-primary hover:bg-primary/90 text-white',
    whatsapp: 'bg-green-500 hover:bg-green-600 text-white',
  };

  return (
    <Button
      className={cn(
        'fixed z-50 rounded-full p-3 shadow-lg',
        positionClasses[position],
        variantClasses[variant],
        className
      )}
      onClick={onClick}
      {...props}
    >
      {icon}
    </Button>
  );
};

export default FloatingActionButton;
