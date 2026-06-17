import { Link } from "@tanstack/react-router"
import { ArrowRight, Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { LoadingReveal } from "@/components/ui/loading-reveal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { List } from "@/types/mtg"

export function ListsListing({
  lists,
  isLoading,
  error,
  typeNameById,
  userId,
  privateFlag,
  currentUserId,
  detailMode = "public",
  detailTo = "/lists/$listId",
  showMobileOpenAction = false,
  showOwnerActions = true,
  onEdit,
  onDelete,
}: {
  lists: List[]
  isLoading: boolean
  error: string | null
  typeNameById: Map<string, string>
  userId?: string | null
  privateFlag?: boolean | null
  currentUserId?: string | null
  detailMode?: "public" | "none"
  detailTo?: "/lists/$listId" | "/my-lists/$listId" | "/public-lists/$listId"
  showMobileOpenAction?: boolean
  showOwnerActions?: boolean
  onEdit: (list: List) => void
  onDelete: (id: string) => void | Promise<void>
}) {
  const visibleLists = lists.filter((l) => {
    if (userId && l.user_id !== userId) return false
    if (typeof privateFlag === "boolean" && l.private !== privateFlag) return false
    return true
  })

  return (
    <>
      {error ? <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">{error}</div> : null}

      <LoadingReveal isLoading={isLoading} label="Carregando listas...">
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="text-sm text-muted-foreground">{isLoading ? "Carregando..." : `${visibleLists.length} lista(s)`}</div>
            </div>

            <div className="grid gap-3 p-4 md:hidden">
              {visibleLists.map((l) => (
                <div key={l.id} className="rounded-xl border border-border/70 bg-background/60 p-4 shadow-sm shadow-black/5">
                  <div className="space-y-2">
                    {detailMode === "public" ? (
                      <Link to={detailTo} params={{ listId: l.id }} className="block text-sm font-medium hover:underline">
                        {l.name_list}
                      </Link>
                    ) : (
                      <div className="block text-sm font-medium">{l.name_list}</div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="muted">{typeNameById.get(l.type_id) ?? "—"}</Badge>
                      {l.name_grimoire ? <Badge variant="muted">{l.name_grimoire}</Badge> : null}
                      {l.private ? <Badge variant="secondary">Privada</Badge> : <Badge variant="muted">Publica</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{l.description ?? "Sem descrição."}</p>
                  </div>

                  {showMobileOpenAction && detailMode === "public" ? (
                    <div className="mt-4 flex items-center justify-end gap-2">
                      <Button asChild size="icon-sm" variant="outline">
                        <Link to={detailTo} params={{ listId: l.id }}>
                          <ArrowRight className="size-4" />
                          <span className="sr-only">Abrir lista</span>
                        </Link>
                      </Button>

                      {showOwnerActions && l.user_id && currentUserId && l.user_id === currentUserId ? (
                        <>
                          <Button
                            size="icon-sm"
                            variant="outline"
                            onClick={() => {
                              onEdit(l)
                            }}
                          >
                            <Pencil className="size-4" />
                            <span className="sr-only">Editar lista</span>
                          </Button>
                          <ConfirmDialog
                            title="Excluir lista?"
                            description={`Essa ação remove a lista "${l.name_list}" e não pode ser desfeita.`}
                            confirmLabel="Excluir"
                            destructive
                            onConfirm={() => onDelete(l.id)}
                            trigger={
                              <Button size="icon-sm" variant="destructive">
                                <Trash2 className="size-4" />
                                <span className="sr-only">Excluir lista</span>
                              </Button>
                            }
                          />
                        </>
                      ) : null}
                    </div>
                  ) : showOwnerActions && l.user_id && currentUserId && l.user_id === currentUserId ? (
                    <div className="mt-4 flex items-center justify-end gap-2">
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => {
                          onEdit(l)
                        }}
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar lista</span>
                      </Button>
                      <ConfirmDialog
                        title="Excluir lista?"
                        description={`Essa ação remove a lista "${l.name_list}" e não pode ser desfeita.`}
                        confirmLabel="Excluir"
                        destructive
                        onConfirm={() => onDelete(l.id)}
                        trigger={
                          <Button size="icon-sm" variant="destructive">
                            <Trash2 className="size-4" />
                            <span className="sr-only">Excluir lista</span>
                          </Button>
                        }
                      />
                    </div>
                  ) : null}
                </div>
              ))}

              {visibleLists.length === 0 && !isLoading ? (
                <div className="rounded-xl border border-border/70 bg-background/40 px-4 py-10 text-center text-sm text-muted-foreground">
                  Nenhuma lista encontrada.
                </div>
              ) : null}
            </div>

            <div className="hidden w-full overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lista</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Grimório</TableHead>
                    <TableHead>Visibilidade</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[140px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleLists.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>
                        {detailMode === "public" ? (
                          <Link to={detailTo} params={{ listId: l.id }} className="font-medium hover:underline">
                            {l.name_list}
                          </Link>
                        ) : (
                          <span className="font-medium">{l.name_list}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="muted">{typeNameById.get(l.type_id) ?? "—"}</Badge>
                      </TableCell>
                      <TableCell>{l.name_grimoire ?? "—"}</TableCell>
                      <TableCell>
                        {l.private ? <Badge variant="secondary">Privada</Badge> : <Badge variant="muted">Publica</Badge>}
                      </TableCell>
                      <TableCell className="max-w-[440px] truncate text-muted-foreground">{l.description ?? "—"}</TableCell>
                      <TableCell>
                        {showOwnerActions && l.user_id && currentUserId && l.user_id === currentUserId ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="icon-sm"
                              variant="outline"
                              onClick={() => {
                                onEdit(l)
                              }}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <ConfirmDialog
                              title="Excluir lista?"
                              description={`Essa ação remove a lista "${l.name_list}" e não pode ser desfeita.`}
                              confirmLabel="Excluir"
                              destructive
                              onConfirm={() => onDelete(l.id)}
                              trigger={
                                <Button size="icon-sm" variant="destructive">
                                  <Trash2 className="size-4" />
                                </Button>
                              }
                            />
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                  {visibleLists.length === 0 && !isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                        Nenhuma lista encontrada.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </LoadingReveal>
    </>
  )
}
