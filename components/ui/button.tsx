import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-white hover:bg-primary/90 shadow-sm",
      secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-sm",
      outline: "border border-neutral-300 bg-transparent hover:bg-neutral-100 text-neutral-700",
      ghost: "bg-transparent hover:bg-neutral-100 text-neutral-700",
      danger: "bg-danger text-white hover:bg-danger/90 shadow-sm",
    }

    const sizes = {
      sm: "h-9 px-3 text-xs rounded-md",
      md: "h-11 px-6 text-sm font-medium rounded-md",
      lg: "h-14 px-8 text-base font-semibold rounded-lg",
      icon: "h-10 w-10 flex items-center justify-center rounded-full",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
