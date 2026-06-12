import { cn } from "@/lib/utils"

export function ScreenLoading({
  show,
  label = "Invocando dados...",
  className,
}: {
  show: boolean
  label?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[90] grid place-items-center transition-opacity duration-500",
        show ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        className
      )}
      role="status"
      aria-live="polite"
      aria-hidden={!show}
    >
      <div className="absolute inset-0 bg-background/55 backdrop-blur-md" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_20%,hsl(var(--primary)/0.16),transparent_70%)]" />
      <div className="absolute inset-0 opacity-[0.22] mix-blend-overlay [background-image:repeating-linear-gradient(135deg,transparent_0px,transparent_8px,hsl(var(--foreground)/0.08)_9px,hsl(var(--foreground)/0.08)_10px)]" />

      <div className="relative flex w-full max-w-sm flex-col items-center gap-5 px-6">
        <Sigil />
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="text-sm font-semibold tracking-tight">{label}</div>
          <div className="text-xs text-muted-foreground">
            A tela aparece só enquanto os dados essenciais são carregados.
          </div>
        </div>
      </div>
    </div>
  )
}

function Sigil() {
  return (
    <div className="relative grid place-items-center">
      <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.22),transparent_65%)] blur-2xl" />
      <div className="relative size-20">
        <div className="absolute inset-0 rounded-full border border-foreground/10 bg-foreground/5 shadow-[0_0_0_1px_hsl(var(--background)/0.4)_inset]" />
        <div className="absolute inset-2 rounded-full border border-foreground/10" />
        <div className="absolute inset-[14px] rounded-full border border-foreground/10" />

        <div className="absolute inset-0 animate-[spellspin_1.6s_linear_infinite]">
          <Dot className="left-1/2 top-0 -translate-x-1/2" />
          <Dot className="right-0 top-1/2 -translate-y-1/2" />
          <Dot className="bottom-0 left-1/2 -translate-x-1/2" />
          <Dot className="left-0 top-1/2 -translate-y-1/2" />
        </div>

        <div className="absolute inset-0 grid place-items-center">
          <div className="size-7 rounded-lg border border-foreground/10 bg-foreground/5 shadow-sm animate-[spellpulse_1.2s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  )
}

function Dot({ className }: { className?: string }) {
  return <div className={cn("absolute size-2 rounded-full bg-foreground/60 shadow-[0_0_0_6px_hsl(var(--foreground)/0.06)]", className)} />
}

