import * as React from "react"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toast } from "radix-ui"

import { cn } from "@/lib/utils"

function ToastProvider(props: React.ComponentProps<typeof Toast.Provider>) {
  return <Toast.Provider swipeDirection="right" {...props} />
}

function ToastViewport({ className, ...props }: React.ComponentProps<typeof Toast.Viewport>) {
  return (
    <Toast.Viewport
      className={cn(
        "fixed top-0 right-0 z-100 flex max-h-screen w-full flex-col gap-2 p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:max-w-sm",
        className
      )}
      {...props}
    />
  )
}

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start justify-between gap-3 overflow-hidden rounded-xl border bg-card p-4 pr-7 shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full sm:data-[state=open]:slide-in-from-bottom-full data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right-full",
  {
    variants: {
      variant: {
        default: "border-border",
        success: "border-emerald-500/50",
        destructive: "border-destructive/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type ToastRootProps = React.ComponentProps<typeof Toast.Root> & VariantProps<typeof toastVariants>

function ToastRoot({ className, variant, ...props }: ToastRootProps) {
  return <Toast.Root className={cn(toastVariants({ variant }), className)} {...props} />
}

function ToastTitle({ className, ...props }: React.ComponentProps<typeof Toast.Title>) {
  return <Toast.Title className={cn("text-sm font-semibold leading-none tracking-tight", className)} {...props} />
}

function ToastDescription({ className, ...props }: React.ComponentProps<typeof Toast.Description>) {
  return <Toast.Description className={cn("text-sm text-muted-foreground", className)} {...props} />
}

function ToastClose({ className, ...props }: React.ComponentProps<typeof Toast.Close>) {
  return (
    <Toast.Close
      className={cn(
        "absolute top-2 right-2 inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        className
      )}
      {...props}
    >
      <X className="size-4" />
    </Toast.Close>
  )
}

export { ToastProvider, ToastViewport, ToastRoot, ToastTitle, ToastDescription, ToastClose }
export type { ToastRootProps }
