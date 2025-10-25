import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow-sm hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border border-gray-300 dark:border-gray-800 bg-white dark:bg-black text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        ghost: "hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 transition-colors duration-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

