import { Link, Outlet, createFileRoute } from "@tanstack/react-router"
import { Layers, LayoutDashboard, ScrollText } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { AppProviders } from "@/contexts/providers/app-providers"

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <AppProviders>
      <div className="relative min-h-dvh overflow-hidden bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-80"
          style={{
            backgroundImage: [
              "radial-gradient(circle at 10% 10%, rgba(209, 145, 143, 0.24), transparent 30%)",
              "radial-gradient(circle at 50% 0%, rgba(163, 146, 220, 0.22), transparent 28%)",
              "radial-gradient(circle at 90% 10%, rgba(160, 182, 232, 0.18), transparent 26%)",
            ].join(", "),
          }}
        />

        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/72 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-border/80 bg-card/90 shadow-lg shadow-black/20">
                <Layers className="size-4 text-primary" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold tracking-tight">SpellQuest</span>
                <span className="text-xs text-muted-foreground">Listas de compra de Magic</span>
              </div>
            </div>

            <nav className="flex items-center gap-1">
              <NavItem to="/" icon={<LayoutDashboard className="size-4" />}>
                Dashboard
              </NavItem>
              <NavItem to="/lists" icon={<ScrollText className="size-4" />}>
                Listas
              </NavItem>
              <NavItem to="/types" icon={<Layers className="size-4" />}>
                Tipos
              </NavItem>
            </nav>
          </div>
          <Separator />
        </header>

        <Outlet />
      </div>
    </AppProviders>
  )
}

function NavItem({
  to,
  icon,
  children,
}: {
  to: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  const baseClassName =
    "flex items-center gap-2 rounded-xl border border-transparent px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:border-border/70 hover:bg-card/70 hover:text-foreground"

  return (
    <Link
      to={to}
      className={baseClassName}
      inactiveProps={{ className: baseClassName }}
      activeProps={{ className: cn(baseClassName, "border-border/80 bg-card text-foreground shadow-sm shadow-black/10") }}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </Link>
  )
}
