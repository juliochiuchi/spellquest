import { Link, createFileRoute } from "@tanstack/react-router"
import { ArrowRight, Shield, Sparkles } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingReveal } from "@/components/ui/loading-reveal"
import * as listsController from "@/controllers/listsController"
import { useAuth } from "@/contexts/auth-context"
import { useMtg } from "@/contexts/mtg-store"
import { PageShell } from "@/contexts/components/page-shell"

export const Route = createFileRoute('/_app/')({
  component: Index,
})

const colorPhilosophies = [
  {
    name: "Branco",
    mana: "W",
    essence: "ordem, proteção e comunidade",
    philosophy: "Busca equilíbrio pela lei, pela disciplina e pela cooperação entre todos.",
    strategy: "Controla o ritmo da partida com ganho de vida, remoções eficientes, exércitos coordenados e efeitos de proteção.",
    representation: "No lore de Magic, o branco representa civilizações, hierarquias, fé, honra e o senso de dever coletivo.",
    accent: "rgba(246, 232, 197, 0.95)",
    surface: "rgba(246, 232, 197, 0.12)",
    border: "rgba(246, 232, 197, 0.3)",
  },
  {
    name: "Azul",
    mana: "U",
    essence: "conhecimento, cálculo e transformação",
    philosophy: "Acredita que tudo pode ser aperfeiçoado com estudo, planejamento e domínio da informação.",
    strategy: "Joga no tempo do oponente com compra de cartas, anulações, manipulação de mão e controle do campo.",
    representation: "No multiverso, o azul simboliza magos, inventores, ilusionistas e sociedades guiadas por intelecto e ambição mental.",
    accent: "rgba(111, 181, 255, 0.95)",
    surface: "rgba(111, 181, 255, 0.12)",
    border: "rgba(111, 181, 255, 0.3)",
  },
  {
    name: "Preto",
    mana: "B",
    essence: "ambição, poder e pragmatismo",
    philosophy: "Aceita qualquer custo para alcançar liberdade, ascensão pessoal e controle sobre o destino.",
    strategy: "Explora recursos extremos com descarte, sacrifício, reanimação, drenagem de vida e remoções implacáveis.",
    representation: "Em Magic, o preto encarna necromantes, demônios, intriga, sobrevivência e a vontade de vencer acima de tudo.",
    accent: "rgba(171, 150, 206, 0.95)",
    surface: "rgba(171, 150, 206, 0.12)",
    border: "rgba(171, 150, 206, 0.3)",
  },
  {
    name: "Vermelho",
    mana: "R",
    essence: "emoção, impulso e liberdade",
    philosophy: "Valoriza a ação imediata, a paixão e a autenticidade acima do controle excessivo.",
    strategy: "Pressiona rápido com dano direto, criaturas agressivas, explosões de mana e jogadas imprevisíveis.",
    representation: "No universo de Magic, o vermelho é a chama dos bárbaros, dragões, artistas, rebeldes e tempestades vulcânicas.",
    accent: "rgba(255, 119, 92, 0.95)",
    surface: "rgba(255, 119, 92, 0.12)",
    border: "rgba(255, 119, 92, 0.3)",
  },
  {
    name: "Verde",
    mana: "G",
    essence: "crescimento, instinto e interdependência",
    philosophy: "Confia na ordem natural do mundo e na força que surge da conexão com a vida.",
    strategy: "Acelera mana, coloca ameaças enormes em campo, fortalece criaturas e domina pelo volume e eficiência orgânica.",
    representation: "No lore, o verde representa florestas ancestrais, feras, druidas e a aceitação do papel de cada ser no todo.",
    accent: "rgba(108, 211, 145, 0.95)",
    surface: "rgba(108, 211, 145, 0.12)",
    border: "rgba(108, 211, 145, 0.3)",
  },
]

function Index() {
  const { typeLists, isLoadingTypes } = useMtg()
  const { user } = useAuth()

  const hasTypes = typeLists.length > 0
  const [totalLists, setTotalLists] = React.useState<number | null>(null)
  const [totalGrimoires, setTotalGrimoires] = React.useState<number | null>(null)
  const [isLoadingCounts, setIsLoadingCounts] = React.useState(false)
  const isLoading = isLoadingCounts || isLoadingTypes
  const canManageOwnLists = Boolean(user)
  const canManageTypes = Boolean(user?.pro)

  React.useEffect(() => {
    let cancelled = false

    queueMicrotask(() => {
      setIsLoadingCounts(true)
      Promise.all([listsController.countLists(), listsController.countGrimoires()])
        .then(([listsCount, grimoiresCount]) => {
          if (cancelled) return
          setTotalLists(listsCount)
          setTotalGrimoires(grimoiresCount)
        })
        .catch(() => {
          if (cancelled) return
          setTotalLists(0)
          setTotalGrimoires(0)
        })
        .finally(() => {
          if (cancelled) return
          setIsLoadingCounts(false)
        })
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <PageShell
      title="Dashboard"
      description="Consulte listas públicas criadas por usuários PRO e acesse sua área privada quando estiver logado."
      actions={
        <div className="flex items-center gap-2">
          {canManageOwnLists ? (
            <Button asChild disabled={!hasTypes}>
              <Link to="/my-lists">
                <Shield className="size-4" />
                Minhas listas
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link to="/lists">
              Ver listas
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      }
    >
      <LoadingReveal isLoading={isLoading} label="Carregando dashboard...">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Listas</CardTitle>
              <CardDescription>Total cadastradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">{totalLists ?? "—"}</div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Grimórios</CardTitle>
              <CardDescription>Listas com grimório associado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">{totalGrimoires ?? "—"}</div>
            </CardContent>
          </Card>
        </div>

        {!canManageOwnLists ? (
          <section className="mt-3 grid gap-4">
            <Card className="overflow-hidden border-border/80 bg-card/80">
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full border border-border/70 bg-background/60 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    Multiversos
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/8 px-3 py-1 text-primary">
                    Guia de identidade
                  </Badge>
                </div>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl sm:text-2xl">Entenda as cores e os mundos que moldam o multiverso</CardTitle>
                    <CardDescription className="max-w-3xl text-sm leading-6 text-muted-foreground">
                      Antes de montar listas ou procurar cartas, vale conhecer o que cada cor valoriza, como ela vence partidas e quais planos traduzem o tom de Magic: The Gathering.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-primary/15 bg-primary/8 px-4 py-3 text-sm text-muted-foreground">
                    <Sparkles className="size-4 text-primary" />
                    Um panorama rápido para novos planeswalkers.
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                    {colorPhilosophies.map((color) => (
                      <article
                        key={color.name}
                        className="rounded-3xl border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                        style={{
                          background: `linear-gradient(135deg, ${color.surface}, rgba(39, 41, 56, 0.82))`,
                          borderColor: color.border,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold tracking-tight" style={{ color: color.accent }}>
                              {color.name}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">{color.essence}</p>
                          </div>
                          <span
                            className="inline-flex min-w-10 items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.3em]"
                            style={{
                              color: color.accent,
                              borderColor: color.border,
                              backgroundColor: color.surface,
                            }}
                          >
                            {color.mana}
                          </span>
                        </div>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                          <p>
                            <span className="font-medium text-foreground">Filosofia:</span> {color.philosophy}
                          </p>
                          <p>
                            <span className="font-medium text-foreground">Estratégia:</span> {color.strategy}
                          </p>
                          <p>
                            <span className="font-medium text-foreground">No universo:</span> {color.representation}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        ) : null}

        {!hasTypes && canManageTypes ? (
          <Card>
            <CardHeader>
              <CardTitle>Primeiro passo</CardTitle>
              <CardDescription>Cadastre os tipos de lista para liberar a criação de listas.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Ex.: Grimório, Interesse, Trade, etc.
              </div>
              <Button asChild>
                <Link to="/types">
                  Ir para tipos
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </LoadingReveal>
    </PageShell>
  )
}
