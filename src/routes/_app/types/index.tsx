import { createFileRoute } from "@tanstack/react-router"
import { Pencil, Plus, Trash2 } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DialogContent, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingReveal } from "@/components/ui/loading-reveal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageShell } from "@/contexts/components/page-shell"
import { useMtg } from "@/contexts/mtg-context"
import type { TypeList } from "@/types/mtg"

export const Route = createFileRoute("/_app/types/")({
  component: TypesPage,
})

function TypesPage() {
  const { typeLists, isLoadingTypes, error, refreshTypeLists, createTypeList, updateTypeList, deleteTypeList } = useMtg()
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<TypeList | null>(null)

  return (
    <PageShell
      title="Tipos de lista"
      description="Ex.: Grimório, Interesse. Eles aparecem no cadastro das listas."
      actions={
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
          >
            <Plus className="size-4" />
            Novo tipo
          </Button>
          <Button variant="outline" onClick={refreshTypeLists} disabled={isLoadingTypes}>
            Atualizar
          </Button>
        </div>
      }
    >
      {error ? <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">{error}</div> : null}

      <LoadingReveal isLoading={isLoadingTypes} label="Carregando tipos...">
        <Card>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-[160px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typeLists.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon-sm"
                            variant="outline"
                            onClick={() => {
                              setEditing(t)
                              setOpen(true)
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <ConfirmDialog
                            title="Excluir tipo?"
                            description={`Essa ação remove o tipo "${t.name}" e não pode ser desfeita.`}
                            confirmLabel="Excluir"
                            destructive
                            onConfirm={() => deleteTypeList(t.id)}
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
                  {typeLists.length === 0 && !isLoadingTypes ? (
                    <TableRow>
                      <TableCell colSpan={2} className="py-10 text-center text-sm text-muted-foreground">
                        Nenhum tipo cadastrado.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </LoadingReveal>

      <TypeFormDialog
        key={`${editing?.id ?? "new"}-${open ? "1" : "0"}`}
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSubmit={async (values) => {
          if (editing) {
            await updateTypeList(editing.id, values)
            return
          }
          await createTypeList(values)
        }}
      />
    </PageShell>
  )
}

function TypeFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: TypeList | null
  onSubmit: (values: Omit<TypeList, "id">) => Promise<void> | void
}) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar tipo" : "Novo tipo"}</DialogTitle>
        </DialogHeader>
        <form
          className="mt-4 flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const data = new FormData(e.currentTarget)
            const name = String(data.get("name") ?? "").trim()
            await onSubmit({ name })
            onOpenChange(false)
          }}
        >
          <div className="flex flex-col gap-2">
            <Label>Nome</Label>
            <Input name="name" defaultValue={initial?.name ?? ""} placeholder="Ex.: Grimório" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  )
}
