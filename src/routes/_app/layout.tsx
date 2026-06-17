import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router"
import { LayoutDashboard, LogIn, LogOut, Menu, ScrollText, Shield, X } from "lucide-react"
import * as React from "react"

import mtgLogo from "@/assets/mtg-logo.png"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { AppProviders } from "@/contexts/providers/app-providers"

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <AppProviders>
      <AppLayoutContent />
    </AppProviders>
  )
}

function AppLayoutContent() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const mobileMenuId = React.useId()

  return (
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
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <div className="flex size-10 items-center justify-center rounded-2xl border border-border/80 bg-card/90 shadow-lg shadow-black/20">
              <img src={mtgLogo} alt="SpellQuest" className="size-6 object-contain" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">SpellQuest</span>
              <span className="hidden text-xs text-muted-foreground sm:inline">Listas de compra de Magic: The Gathering</span>
            </div>

            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              className="ml-auto rounded-xl sm:hidden"
              aria-controls={mobileMenuId}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              <span className="sr-only">{mobileMenuOpen ? "Fechar menu" : "Abrir menu"}</span>
            </Button>
          </div>

          <div
            id={mobileMenuId}
            className={cn(
              "flex w-full flex-col gap-2 rounded-2xl border border-border/70 bg-card/50 p-2 shadow-sm shadow-black/10 sm:w-auto sm:flex-row sm:items-center sm:gap-3 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none",
              mobileMenuOpen ? "flex" : "hidden sm:flex"
            )}
            onClickCapture={() => setMobileMenuOpen(false)}
          >
            <nav className="flex w-full flex-col gap-1 sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-1">
              <NavItem to="/" icon={<LayoutDashboard className="size-4" />}>
                Dashboard
              </NavItem>
              <NavItem to="/lists" icon={<ScrollText className="size-4" />}>
                Listas
              </NavItem>
            </nav>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {isAuthenticated ? (
                <>
                  <Button asChild size="sm" variant="outline" className="w-full rounded-xl px-4 sm:w-auto">
                    <Link to="/my-lists">
                      <Shield className="size-4" />
                      Minha area
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="w-full rounded-xl px-4 sm:w-auto"
                    variant="outline"
                    onClick={() => {
                      logout()
                      void navigate({ to: "/" })
                    }}
                  >
                    <LogOut className="size-4" />
                    Sair{user ? ` (${user.nickname})` : ""}
                  </Button>
                </>
              ) : (
                <Button asChild size="sm" className="w-full rounded-xl px-4 sm:w-auto">
                  <Link to="/login">
                    <LogIn className="size-4" />
                    Entrar
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
        <Separator />
      </header>

      <Outlet />
    </div>
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
    "flex w-full items-center justify-start gap-2 rounded-xl border border-transparent px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:border-border/70 hover:bg-card/70 hover:text-foreground sm:w-auto"

  return (
    <Link
      to={to}
      className={baseClassName}
      inactiveProps={{ className: baseClassName }}
      activeProps={{ className: cn(baseClassName, "border-border/80 bg-card text-foreground shadow-sm shadow-black/10") }}
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}
