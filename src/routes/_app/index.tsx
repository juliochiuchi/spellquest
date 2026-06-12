import { Link, createFileRoute } from "@tanstack/react-router"
import { ArrowRight, Plus } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingReveal } from "@/components/ui/loading-reveal"
import { useMtg } from "@/contexts/mtg-context"
import { ListFormDialog } from "@/contexts/components/forms/list-form-dialog"
import { PageShell } from "@/contexts/components/page-shell"

export const Route = createFileRoute('/_app/')({
  component: Index,
})

function Index() {
  const { lists, typeLists, isLoadingLists, isLoadingTypes, createList } = useMtg()
  const [open, setOpen] = React.useState(false)

  const hasTypes = typeLists.length > 0
  const totalLists = lists.length
  const withGrimoire = lists.filter((l) => Boolean(l.name_grimoire?.trim())).length
  const isLoading = isLoadingLists || isLoadingTypes

  return (
    <PageShell
      title="Dashboard"
      description="Gerencie listas de cartas que você deseja comprar e copie no formato da LigaMagic."
      actions={
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpen(true)} disabled={!hasTypes}>
            <Plus className="size-4" />
            Nova lista
          </Button>
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
              <div className="text-3xl font-semibold tracking-tight">{totalLists}</div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Grimórios</CardTitle>
              <CardDescription>Listas com grimório associado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">{withGrimoire}</div>
            </CardContent>
          </Card>
        </div>

        {!hasTypes ? (
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

      <ListFormDialog
        open={open}
        onOpenChange={setOpen}
        typeLists={typeLists}
        onSubmit={async (values) => {
          await createList({
            type_id: values.type_id,
            name_list: values.name_list,
            name_grimoire: values.name_grimoire,
            description: values.description,
          })
        }}
      />
    </PageShell>
  )
}
