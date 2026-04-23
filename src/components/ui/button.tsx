import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border border-orange-500 bg-orange-500 text-white shadow-[0_10px_24px_rgba(249,115,22,0.2)] hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-[0_14px_28px_rgba(249,115,22,0.24)]",
        destructive:
          "border border-red-400/30 bg-linear-to-r from-red-500 to-orange-500 text-white shadow-[0_10px_30px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_16px_44px_rgba(239,68,68,0.4)] focus-visible:ring-destructive/20",
        outline:
          "border border-slate-200 bg-white text-slate-700 shadow-[0_4px_12px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700",
        secondary:
          "border border-orange-100 bg-orange-50 text-orange-700 shadow-[0_4px_12px_rgba(249,115,22,0.08)] hover:-translate-y-0.5 hover:bg-orange-100",
        ghost:
          "text-slate-700 hover:bg-orange-50 hover:text-orange-700",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 gap-1.5 px-3.5 text-xs has-[>svg]:px-3",
        lg: "h-12 px-7 text-base has-[>svg]:px-5",
        icon: "size-11 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
