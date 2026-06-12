import { Link, createFileRoute } from "@tanstack/react-router"
import { Pencil, Plus, Trash2 } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { LoadingReveal } from "@/components/ui/loading-reveal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useMtg } from "@/contexts/mtg-context"
import { ListFormDialog } from "@/contexts/components/forms/list-form-dialog"
import { PageShell } from "@/contexts/components/page-shell"
import type { List } from "@/types/mtg"

export const Route = createFileRoute("/_app/lists/")({
  component: ListsPage,
})

function ListsPage() {
  const { lists, typeLists, isLoadingLists, error, refreshLists, createList, updateList, deleteList } = useMtg()

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
      description="Crie listas vinculadas a grimórios ou listas de interesse."
      actions={
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
            disabled={typeLists.length === 0}
          >
            <Plus className="size-4" />
            Nova lista
          </Button>
          <Button variant="outline" onClick={refreshLists} disabled={isLoadingLists}>
            Atualizar
          </Button>
        </div>
      }
    >
      {error ? <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">{error}</div> : null}

      <LoadingReveal isLoading={isLoadingLists} label="Carregando listas...">
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="text-sm text-muted-foreground">
                {isLoadingLists ? "Carregando..." : `${lists.length} lista(s)`}
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lista</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Grimório</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[140px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lists.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <Link to="/lists/$listId" params={{ listId: l.id }} className="font-medium hover:underline">
                          {l.name_list}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="muted">{typeNameById.get(l.type_id) ?? "—"}</Badge>
                      </TableCell>
                      <TableCell>{l.name_grimoire ?? "—"}</TableCell>
                      <TableCell className="max-w-[440px] truncate text-muted-foreground">{l.description ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon-sm"
                            variant="outline"
                            onClick={() => {
                              setEditing(l)
                              setOpen(true)
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <ConfirmDialog
                            title="Excluir lista?"
                            description={`Essa ação remove a lista "${l.name_list}" e não pode ser desfeita.`}
                            confirmLabel="Excluir"
                            destructive
                            onConfirm={() => deleteList(l.id)}
                            trigger={
                              <Button size="icon-sm" variant="destructive">
                                <Trash2 className="size-4" />
                              </Button>
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {lists.length === 0 && !isLoadingLists ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        Nenhuma lista cadastrada.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </LoadingReveal>

      <ListFormDialog
        open={open}
        onOpenChange={setOpen}
        typeLists={typeLists}
        initial={editing}
        onSubmit={async (values) => {
          if (editing) {
            await updateList(editing.id, {
              type_id: values.type_id,
              name_list: values.name_list,
              name_grimoire: values.name_grimoire,
              description: values.description,
            })
            return
          }

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
