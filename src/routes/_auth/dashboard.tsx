import { Link, createFileRoute } from "@tanstack/react-router"
import { ArrowRight, Shield, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageShell } from "@/contexts/components/page-shell"
import { useAuth } from "@/contexts/auth-context"

export const Route = createFileRoute('/_auth/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { user } = useAuth()

  return (
    <PageShell
      title="Area privada"
      description="Acompanhe seu espaço autenticado e navegue para as listas do seu usuário."
      actions={
        <Button asChild>
          <Link to="/my-lists">
            <Shield className="size-4" />
            Minhas listas
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 bg-card/85 shadow-xl shadow-black/10">
          <CardHeader>
            <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <Shield className="size-5" />
            </div>
            <CardTitle>Bem-vindo, {user?.nickname ?? "invocador"}</CardTitle>
            <CardDescription>
              Esta é sua área autenticada. Aqui você pode acompanhar e gerenciar as listas vinculadas ao seu usuário.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Seu plano atual é <span className="font-medium text-foreground">{user?.pro ? "PRO" : "gratuito"}</span>.
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/80 shadow-lg shadow-black/10">
          <CardHeader>
            <div className="flex size-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <Sparkles className="size-5" />
            </div>
            <CardTitle>Próximo passo</CardTitle>
            <CardDescription>
              Acesse suas listas para alternar entre conteúdo público e privado do seu perfil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/my-lists">
                Abrir minhas listas
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
