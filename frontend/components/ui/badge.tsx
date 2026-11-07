import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "bg-[#10A37F]/10 text-[#10A37F] border border-[#10A37F]/30",
        secondary: "bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]",
        destructive: "bg-[#EF4146]/10 text-[#EF4146] border border-[#EF4146]/30",
        outline: "text-[var(--text)] border border-[var(--border)] bg-transparent",
        amber: "bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/30",
        blue: "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
