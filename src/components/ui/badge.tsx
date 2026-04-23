import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-orange-200 bg-orange-50 text-orange-700 [a&]:hover:bg-orange-100",
        secondary:
          "border-slate-200 bg-white text-slate-700 [a&]:hover:bg-slate-50",
        destructive:
          "border-red-400/30 bg-red-400/15 text-red-100 [a&]:hover:bg-red-400/20 focus-visible:ring-destructive/20",
        outline:
          "border-slate-200 bg-white text-slate-600 [a&]:hover:bg-orange-50 [a&]:hover:text-orange-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
