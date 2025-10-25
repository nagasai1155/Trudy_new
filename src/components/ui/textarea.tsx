import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-black px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-950 transition-all duration-300 ease-out hover:border-gray-400 dark:hover:border-gray-700 hover:shadow-sm focus:shadow-md focus:scale-[1.01] active:scale-[0.99]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

