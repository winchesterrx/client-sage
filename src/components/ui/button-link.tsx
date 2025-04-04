
import * as React from "react"
import { Link } from "react-router-dom"
import { Button, buttonVariants } from "@/components/ui/button"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

interface ButtonLinkProps extends React.ComponentPropsWithoutRef<typeof Link>, 
  VariantProps<typeof buttonVariants> {
  href: string;
  className?: string;
  children: React.ReactNode;
}

const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, variant, size, href, children, ...props }, ref) => {
    return (
      <Link 
        to={href} 
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref} 
        {...props}
      >
        {children}
      </Link>
    )
  }
)
ButtonLink.displayName = "ButtonLink"

export { ButtonLink }
