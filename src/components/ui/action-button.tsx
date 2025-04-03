
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cva, type VariantProps } from 'class-variance-authority';

const actionButtonVariants = cva(
  "rounded-full p-3 shadow-lg fixed z-50 transition-all duration-200 hover:scale-105",
  {
    variants: {
      variant: {
        primary: "bg-primary hover:bg-primary/90 text-primary-foreground",
        secondary: "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
        success: "bg-green-500 hover:bg-green-600 text-white",
        danger: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
        whatsapp: "bg-green-500 hover:bg-green-600 text-white",
      },
      position: {
        'bottom-right': "right-6 bottom-6",
        'bottom-left': "left-6 bottom-6",
        'top-right': "right-6 top-6",
        'top-left': "left-6 top-6",
        'middle-right': "right-6 top-1/2 -translate-y-1/2",
        'middle-left': "left-6 top-1/2 -translate-y-1/2",
      },
      size: {
        sm: "h-10 w-10",
        md: "h-12 w-12",
        lg: "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "primary",
      position: "bottom-right",
      size: "md",
    },
  }
);

export interface ActionButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof actionButtonVariants> {
  icon: React.ReactNode;
  tooltip?: string;
  onClick?: () => void;
}

const ActionButton = ({
  icon,
  tooltip,
  variant,
  position,
  size,
  onClick,
  className,
  ...props
}: ActionButtonProps) => {
  const button = (
    <Button
      type="button"
      className={cn(actionButtonVariants({ variant, position, size }), className)}
      onClick={onClick}
      {...props}
    >
      {icon}
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};

export default ActionButton;
