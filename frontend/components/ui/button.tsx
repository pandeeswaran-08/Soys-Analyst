import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#10A37F] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default: "bg-[#10A37F] text-white shadow-xs hover:bg-[#0D8A6D] active:scale-[0.99]",
        destructive: "bg-[#EF4146] text-white shadow-xs hover:bg-[#D9383D]",
        outline: "border border-[var(--border)] bg-transparent text-[var(--text)] hover:bg-[var(--surface)] hover:border-[var(--text-muted)]",
        secondary: "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg)]",
        ghost: "text-[var(--text)] hover:bg-[var(--surface)] hover:text-[var(--text)]",
        link: "text-[#10A37F] underline-offset-4 hover:underline",
        amber: "bg-[#F5A623] text-white shadow-xs hover:bg-[#D98E16]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
