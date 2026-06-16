import { Link, Outlet, createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { Layers, LayoutDashboard, LogOut, ScrollText, Shield } from "lucide-react"

import mtgLogo from "@/assets/mtg-logo.png"
import { getAuthUser } from "@/controllers/authController"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { AppProviders } from "@/contexts/providers/app-providers"
import { cn } from "@/lib/utils"

export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    if (!getAuthUser()) {
      throw redirect({ to: "/login" })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <AppProviders>
      <AuthLayoutContent />
    </AppProviders>
  )
}

function AuthLayoutContent() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const showTypes = Boolean(user?.pro)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/72 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl border border-border/80 bg-card/90 shadow-lg shadow-black/20">
              <img src={mtgLogo} alt="SpellQuest" className="size-6 object-contain" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold tracking-tight">Área logada</span>
              <span className="text-xs text-muted-foreground">{user ? `${user.nickname}${user.pro ? " • PRO" : ""}` : "—"}</span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <nav className="grid w-full grid-cols-4 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-1">
              <NavItem to="/dashboard" icon={<LayoutDashboard className="size-4" />}>
                Dashboard
              </NavItem>
              <NavItem to="/my-lists" icon={<Shield className="size-4" />}>
                Minhas listas
              </NavItem>
              <NavItem to="/public-lists" icon={<ScrollText className="size-4" />}>
                Públicas
              </NavItem>
              {showTypes ? (
                <NavItem to="/types" icon={<Layers className="size-4" />}>
                  Tipos
                </NavItem>
              ) : null}
            </nav>

            <Button
              size="sm"
              variant="outline"
              className="w-full rounded-xl px-4 sm:w-auto"
              onClick={() => {
                logout()
                void navigate({ to: "/" })
              }}
            >
              <LogOut className="size-4" />
              Sair
            </Button>
          </div>
        </div>
        <Separator />
      </header>

      <Outlet />
    </>
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
    "flex w-full items-center justify-center gap-2 rounded-xl border border-transparent px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:border-border/70 hover:bg-card/70 hover:text-foreground sm:w-auto sm:justify-start"

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
