import * as React from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CopyToClipboardButton({
  text,
  label = "Copiar",
  size = "sm",
  variant = "outline",
  disabled,
}: {
  text: string
  label?: string
  size?: React.ComponentProps<typeof Button>["size"]
  variant?: React.ComponentProps<typeof Button>["variant"]
  disabled?: boolean
}) {
  const [copied, setCopied] = React.useState(false)

  const onCopy = React.useCallback(async () => {
    if (disabled) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }, [disabled, text])

  return (
    <Button type="button" variant={variant} size={size} onClick={onCopy} disabled={disabled}>
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      <span className="sr-only">{label}</span>
    </Button>
  )
}
