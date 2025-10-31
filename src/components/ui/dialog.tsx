import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[70] bg-black/50 dark:bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const internalRef = React.useRef<HTMLDivElement | null>(null)
  
  // Helper to safely set forwarded refs (function or object) without TS readonly errors
  function setForwardedRef<T>(forwardedRef: React.ForwardedRef<T>, value: T | null) {
    if (typeof forwardedRef === 'function') {
      forwardedRef(value)
    } else if (forwardedRef) {
      ;(forwardedRef as React.MutableRefObject<T | null>).current = value
    }
  }
  
  React.useEffect(() => {
    if (internalRef.current) {
      const element = internalRef.current
      // Keep positioning transforms but remove animations
      element.style.animation = 'none'
      element.style.transition = 'none'
      element.style.opacity = '1'
      
      // Remove all animation-related classes but keep positioning
      const classesToRemove = ['animate-in', 'animate-out', 'fade-in-0', 'fade-out-0', 'zoom-in-95', 'zoom-out-95',
        'slide-in-from-left-1/2', 'slide-in-from-top-48%', 'slide-out-to-left-1/2', 'slide-out-to-top-48%']
      classesToRemove.forEach(cls => element.classList.remove(cls))
    }
  }, [])
  
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={(node) => {
          (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node as HTMLDivElement | null
          setForwardedRef(ref, node as React.ElementRef<typeof DialogPrimitive.Content> | null)
        }}
        onAnimationEnd={(e) => e.stopPropagation()}
        className={cn(
          "fixed left-[50%] top-[50%] z-[70] grid w-[calc(100%-2rem)] sm:w-full max-w-lg gap-4 border border-gray-200 dark:border-gray-900 bg-white dark:bg-black p-4 sm:p-6 shadow-lg rounded-lg",
          // Critical: Keep these transforms for centering
          "translate-x-[-50%] translate-y-[-50%]",
          // Remove animations but keep positioning
          "![animation:none]",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 disabled:pointer-events-none text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-white",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-gray-600 dark:text-gray-400", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

