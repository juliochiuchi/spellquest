import * as React from "react"

import { ToastClose, ToastDescription, ToastProvider, ToastRoot, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { dismiss, useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant, open }) => (
        <ToastRoot
          key={id}
          open={open}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) dismiss(id)
          }}
          variant={variant}
        >
          <div className="flex flex-1 flex-col gap-1">
            {title ? <ToastTitle>{title}</ToastTitle> : null}
            {description ? <ToastDescription>{description}</ToastDescription> : null}
          </div>
          <ToastClose />
        </ToastRoot>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

