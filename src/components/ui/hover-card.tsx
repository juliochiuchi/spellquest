import * as React from "react"
import { HoverCard } from "radix-ui"

import { cn } from "@/lib/utils"

function HoverCardRoot(props: React.ComponentProps<typeof HoverCard.Root>) {
  return <HoverCard.Root {...props} />
}

function HoverCardTrigger(props: React.ComponentProps<typeof HoverCard.Trigger>) {
  return <HoverCard.Trigger {...props} />
}

function HoverCardContent({ className, ...props }: React.ComponentProps<typeof HoverCard.Content>) {
  return (
    <HoverCard.Portal>
      <HoverCard.Content
        className={cn(
          "z-50 w-80 rounded-xl border bg-popover p-3 text-popover-foreground shadow-md outline-none",
          className
        )}
        {...props}
      />
    </HoverCard.Portal>
  )
}

export { HoverCardRoot, HoverCardTrigger, HoverCardContent }

