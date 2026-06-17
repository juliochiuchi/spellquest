import { createFileRoute } from "@tanstack/react-router"
import { Loader2, RefreshCw } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { ListsListing } from "@/contexts/components/lists-listing"
import { PageShell } from "@/contexts/components/page-shell"
import { useAuth } from "@/contexts/auth-context"
import { useMtg } from "@/contexts/mtg-store"

export const Route = createFileRoute("/_auth/public-lists/")({
  component: PublicListsPage,
})

function PublicListsPage() {
  const { lists, typeLists, isLoadingLists, error, refreshLists, deleteList } = useMtg()
  const { user } = useAuth()

  const typeNameById = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const t of typeLists) map.set(t.id, t.name)
    return map
  }, [typeLists])

  return (
    <PageShell
      title="Listas públicas"
      description="Explore listas públicas criadas por usuários PRO."
      actions={
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button className="w-full sm:w-auto" variant="outline" onClick={refreshLists} disabled={isLoadingLists}>
            {isLoadingLists ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            {isLoadingLists ? "Atualizando..." : "Atualizar"}
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
        showOwnerActions={Boolean(user?.pro)}
        detailTo="/public-lists/$listId"
        onEdit={() => {}}
        onDelete={(id) => deleteList(id)}
      />
    </PageShell>
  )
}
