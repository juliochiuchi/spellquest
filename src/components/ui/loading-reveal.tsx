import * as React from "react"

import { cn } from "@/lib/utils"

export function LoadingReveal({
  isLoading,
  children,
  className,
  label = "Carregando...",
}: {
  isLoading: boolean
  children: React.ReactNode
  className?: string
  label?: string
}) {
  const [showOverlay, setShowOverlay] = React.useState(isLoading)
  const [didLoadOnce, setDidLoadOnce] = React.useState(!isLoading)

  React.useEffect(() => {
    if (isLoading) {
      setShowOverlay(true)
      return
    }

    setDidLoadOnce(true)
    const t = window.setTimeout(() => setShowOverlay(false), 420)
    return () => window.clearTimeout(t)
  }, [isLoading])

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "transition-[opacity,filter,transform] duration-500 will-change-[opacity,transform,filter]",
          isLoading ? "opacity-65 blur-[1.5px] scale-[0.995]" : "opacity-100 blur-0 scale-100",
          !isLoading && didLoadOnce ? "animate-in fade-in slide-in-from-bottom-2 duration-500" : ""
        )}
      >
        {children}
      </div>

      {showOverlay ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-500",
            isLoading ? "opacity-100" : "opacity-0"
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-2xl border bg-background/70 px-4 py-3 shadow-sm backdrop-blur">
            <MiniSigil />
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function MiniSigil() {
  return (
    <div className="relative size-6">
      <div className="absolute inset-0 rounded-full border border-foreground/15 bg-foreground/5" />
      <div className="absolute inset-0 animate-[spellspin_1.2s_linear_infinite]">
        <div className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full bg-foreground/60" />
        <div className="absolute right-0 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-foreground/60" />
        <div className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-foreground/60" />
        <div className="absolute left-0 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-foreground/60" />
      </div>
    </div>
  )
}

