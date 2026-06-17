import * as React from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  onConfirm,
}: {
  trigger: React.ReactElement
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => Promise<void> | void
}) {
  const [open, setOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)

  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            disabled={isPending}
            onClick={async () => {
              try {
                setIsPending(true)
                await onConfirm()
                setOpen(false)
              } finally {
                setIsPending(false)
              }
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processando...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
