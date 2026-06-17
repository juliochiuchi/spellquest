import { createFileRoute } from "@tanstack/react-router"
import { Plus, RefreshCw, Shield, Sparkles } from "lucide-react"
import * as React from "react"

import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getErrorMessage } from "@/controllers/errorController"
import * as listsController from "@/controllers/listsController"
import { ListFormDialog } from "@/contexts/components/forms/list-form-dialog"
import { ListsListing } from "@/contexts/components/lists-listing"
import { PageShell } from "@/contexts/components/page-shell"
import { useAuth } from "@/contexts/auth-context"
import { useMtg } from "@/contexts/mtg-store"
import type { List } from "@/types/mtg"

export const Route = createFileRoute('/_auth/my-lists/')({
  component: MyListsPage,
})

type VisibilityFilter = "all" | "public" | "private"

function MyListsPage() {
  const { user } = useAuth()
  const { typeLists, isLoadingTypes } = useMtg()
  const [lists, setLists] = React.useState<List[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [filter, setFilter] = React.useState<VisibilityFilter>("all")
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<List | null>(null)

  const typeNameById = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const typeList of typeLists) map.set(typeList.id, typeList.name)
    return map
  }, [typeLists])

  const privateFlag = filter === "all" ? null : filter === "private"
  const canCreateList = Boolean(user?.pro)

  const refreshMyLists = React.useCallback(async () => {
    if (!user) return

    setError(null)
    setIsLoading(true)
    try {
      const data = await listsController.listListsFiltered({ userId: user.id })
      setLists(data ?? [])
    } catch (nextError) {
      const message = getErrorMessage(nextError, "Nao foi possivel carregar suas listas")
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    queueMicrotask(() => {
      void refreshMyLists()
    })
  }, [refreshMyLists])

  return (
    <PageShell
      title="Minhas listas"
      description="Gerencie suas listas públicas e privadas em um só lugar."
      actions={
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {canCreateList ? (
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setEditing(null)
                setOpen(true)
              }}
              disabled={typeLists.length === 0 || isLoadingTypes}
            >
              <Plus className="size-4" />
              Nova lista
            </Button>
          ) : null}
          <Button className="w-full sm:w-auto" variant="outline" onClick={() => void refreshMyLists()} disabled={isLoading}>
            <RefreshCw className="size-4" />
            Atualizar
          </Button>
        </div>
      }
    >
      {!canCreateList ? (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader>
            <div className="flex size-11 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
              <Sparkles className="size-5" />
            </div>
            <CardTitle>Criação disponível para usuários PRO</CardTitle>
            <CardDescription>
              Sua conta atual pode consultar a área privada, mas a criação de listas só aparece para usuários com `pro = true`.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card className="border-border/80 bg-card/80 shadow-lg shadow-black/10">
        <CardHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <Shield className="size-5" />
            </div>
            <div>
              <CardTitle>Visibilidade</CardTitle>
              <CardDescription>Filtre suas listas entre todas, públicas e privadas.</CardDescription>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border/80 bg-background/60 p-1">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
              Todas
            </FilterButton>
            <FilterButton active={filter === "public"} onClick={() => setFilter("public")}>
              Públicas
            </FilterButton>
            <FilterButton active={filter === "private"} onClick={() => setFilter("private")}>
              Privadas
            </FilterButton>
          </div>
        </CardHeader>
      </Card>

      <ListsListing
        lists={lists}
        isLoading={isLoading}
        error={error}
        typeNameById={typeNameById}
        userId={user?.id ?? null}
        privateFlag={privateFlag}
        currentUserId={user?.id ?? null}
        detailTo="/my-lists/$listId"
        showMobileOpenAction
        onEdit={(list) => {
          if (!canCreateList) return
          setEditing(list)
          setOpen(true)
        }}
        onDelete={async (id) => {
          try {
            await listsController.deleteList(id)
            setLists((current) => current.filter((list) => list.id !== id))
            toast({
              title: "Lista removida",
              variant: "success",
            })
          } catch (nextError) {
            const message = getErrorMessage(nextError, "Nao foi possivel remover a lista")
            setError(message)
            toast({
              title: "Erro ao remover lista",
              description: message,
              variant: "destructive",
            })
          }
        }}
      />

      <ListFormDialog
        open={open}
        onOpenChange={setOpen}
        typeLists={typeLists}
        initial={editing}
        allowPrivateField
        onSubmit={async (values) => {
          if (!user?.pro) {
            toast({
              title: "Conta sem acesso PRO",
              description: "A criação de listas está disponível apenas para usuários PRO.",
              variant: "destructive",
            })
            return
          }

          try {
            if (editing) {
              const updated = await listsController.updateList(editing.id, {
                type_id: values.type_id,
                name_list: values.name_list,
                name_grimoire: values.name_grimoire,
                description: values.description,
                private: values.private,
              })

              if (updated) {
                setLists((current) => current.map((list) => (list.id === editing.id ? updated : list)))
                toast({
                  title: "Lista atualizada",
                  description: updated.name_list,
                  variant: "success",
                })
              }
              return
            }

            const created = await listsController.createList({
              user_id: user.id,
              type_id: values.type_id,
              name_list: values.name_list,
              name_grimoire: values.name_grimoire,
              description: values.description,
              private: values.private,
            })

            if (created) {
              setLists((current) => [...current, created].sort((a, b) => a.name_list.localeCompare(b.name_list)))
              toast({
                title: "Lista criada",
                description: created.name_list,
                variant: "success",
              })
            }
          } catch (nextError) {
            const message = getErrorMessage(nextError, "Nao foi possivel salvar a lista")
            setError(message)
            toast({
              title: "Erro ao salvar lista",
              description: message,
              variant: "destructive",
            })
          }
        }}
      />
    </PageShell>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button type="button" size="sm" variant={active ? "default" : "ghost"} className="rounded-xl" onClick={onClick}>
      {children}
    </Button>
  )
}
