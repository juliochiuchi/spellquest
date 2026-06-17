import { createFileRoute } from "@tanstack/react-router"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ListFormDialog } from "@/contexts/components/forms/list-form-dialog"
import { ListsListing } from "@/contexts/components/lists-listing"
import { useMtg } from "@/contexts/mtg-store"
import { PageShell } from "@/contexts/components/page-shell"
import type { List } from "@/types/mtg"

export const Route = createFileRoute("/_app/lists/")({
  component: ListsPage,
})

function ListsPage() {
  const { lists, typeLists, isLoadingLists, error, refreshLists, updateList, deleteList } = useMtg()
  const { user } = useAuth()
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<List | null>(null)

  const typeNameById = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const t of typeLists) map.set(t.id, t.name)
    return map
  }, [typeLists])

  return (
    <PageShell
      title="Listas"
      description="Listas públicas cadastradas por todos os usuários."
      actions={
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button className="w-full sm:w-auto" variant="outline" onClick={refreshLists} disabled={isLoadingLists}>
            Atualizar
          </Button>
        </div>
      }
    >
      <ListsListing
        lists={lists}
        isLoading={isLoadingLists}
        error={error}
        typeNameById={typeNameById}
        privateFlag={false}
        currentUserId={user?.id ?? null}
        showMobileOpenAction
        showOwnerActions={Boolean(user?.pro)}
        onEdit={(list) => {
          if (!user?.pro) {
            toast({
              title: "Acesso restrito",
              description: "A edição de listas está disponível apenas para usuários PRO.",
              variant: "destructive",
            })
            return
          }
          setEditing(list)
          setOpen(true)
        }}
        onDelete={(id) => deleteList(id)}
      />

      <ListFormDialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) setEditing(null)
        }}
        typeLists={typeLists}
        initial={editing}
        onSubmit={async (values) => {
          if (!editing) return
          if (!user?.pro) return

          await updateList(editing.id, {
            type_id: values.type_id,
            name_list: values.name_list,
            name_grimoire: values.name_grimoire,
            description: values.description,
            private: false,
          })
        }}
      />
    </PageShell>
  )
}
