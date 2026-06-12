import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { Select } from "radix-ui"

import { cn } from "@/lib/utils"

function SelectRoot(props: React.ComponentProps<typeof Select.Root>) {
  return <Select.Root {...props} />
}

function SelectValue(props: React.ComponentProps<typeof Select.Value>) {
  return <Select.Value {...props} />
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof Select.Trigger>) {
  return (
    <Select.Trigger
      className={cn(
        "flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <Select.Icon asChild>
        <ChevronDown className="size-4 opacity-60" />
      </Select.Icon>
    </Select.Trigger>
  )
}

function SelectContent({ className, children, ...props }: React.ComponentProps<typeof Select.Content>) {
  return (
    <Select.Portal>
      <Select.Content
        className={cn(
          "z-[60] min-w-[8rem] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-md",
          className
        )}
        {...props}
      >
        <Select.Viewport className="p-1">{children}</Select.Viewport>
      </Select.Content>
    </Select.Portal>
  )
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof Select.Item>) {
  return (
    <Select.Item
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-1.5 pr-8 pl-2 text-sm outline-none select-none focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <Select.ItemIndicator className="absolute right-2 inline-flex items-center justify-center">
        <Check className="size-4" />
      </Select.ItemIndicator>
      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  )
}

export { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem }
