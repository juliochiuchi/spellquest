import { Check, ChevronDown } from "lucide-react"
import * as React from "react"
import { Popover } from "radix-ui"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

type MultiSelectOption = {
  value: string
  label: string
}

function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = "Selecione uma ou mais opcoes",
  disabled = false,
  className,
}: {
  options: MultiSelectOption[]
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  const [open, setOpen] = React.useState(false)

  const selectedOptions = options.filter((option) => value.includes(option.value))

  const toggleValue = (optionValue: string) => {
    const nextValue = value.includes(optionValue)
      ? value.filter((currentValue) => currentValue !== optionValue)
      : [...value, optionValue]

    onValueChange(nextValue)
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-auto min-h-9 w-full justify-between gap-2 px-3 py-2 text-left font-normal",
            value.length === 0 && "text-muted-foreground",
            className
          )}
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge key={option.value} variant="muted" className="max-w-full">
                  {option.label}
                </Badge>
              ))
            ) : (
              <span>{placeholder}</span>
            )}
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-60 w-(--radix-popover-trigger-width) rounded-xl border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <div className="flex flex-col gap-1">
            {options.map((option) => {
              const checked = value.includes(option.value)

              return (
                <div
                  key={option.value}
                  role="button"
                  aria-disabled={disabled}
                  tabIndex={disabled ? -1 : 0}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none transition-colors focus-visible:bg-muted",
                    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted"
                  )}
                  onClick={() => {
                    if (disabled) return
                    toggleValue(option.value)
                  }}
                  onKeyDown={(event) => {
                    if (disabled) return
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      toggleValue(option.value)
                    }
                  }}
                >
                  <Checkbox
                    checked={checked}
                    className="pointer-events-none"
                    onCheckedChange={() => {}}
                  />
                  <span className="flex-1 text-left">{option.label}</span>
                  {checked ? <Check className="size-4 text-primary" /> : null}
                </div>
              )
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export { MultiSelect }
