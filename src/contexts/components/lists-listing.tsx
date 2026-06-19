import { Link } from "@tanstack/react-router"
import { ArrowRight, Pencil, Plus, Trash2 } from "lucide-react"
import { Popover } from "radix-ui"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { HoverCardContent, HoverCardRoot, HoverCardTrigger } from "@/components/ui/hover-card"
import { LoadingReveal } from "@/components/ui/loading-reveal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LIST_COLOR_LABELS } from "@/constants/list-colors"
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
                    <div className="flex flex-wrap items-center gap-2">
                      <ListColors colors={l.colors} compact />
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
                    <TableHead className="w-[170px]">Cores</TableHead>
                    <TableHead>Visibilidade</TableHead>
                    <TableHead className="w-[220px]">Descrição</TableHead>
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
                        <ListColors colors={l.colors} />
                      </TableCell>
                      <TableCell>
                        {l.private ? <Badge variant="secondary">Privada</Badge> : <Badge variant="muted">Publica</Badge>}
                      </TableCell>
                      <TableCell>
                        <ListDescription description={l.description} />
                      </TableCell>
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
                      <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
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

function ListColors({ colors, compact = false }: { colors: List["colors"], compact?: boolean }) {
  if (colors.length === 0) {
    return <span className={compact ? "text-xs text-muted-foreground" : "text-sm text-muted-foreground"}>{compact ? "Sem cores definidas." : "—"}</span>
  }

  const visibleColors = colors.slice(0, 2)
  const hiddenColors = colors.slice(2)

  return (
    <div className={compact ? "flex flex-wrap items-center gap-2" : "flex flex-nowrap items-center gap-2"}>
      {visibleColors.map((color) => (
        <Badge key={color} variant="outline" className={!compact ? "shrink-0" : undefined}>
          {LIST_COLOR_LABELS[color]}
        </Badge>
      ))}

      {hiddenColors.length > 0 ? (
        <Popover.Root>
          <Popover.Trigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              className="shrink-0 rounded-md"
              aria-label={`Exibir mais ${hiddenColors.length} cor(es)`}
            >
              <Plus className="size-3" />
            </Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={6}
              className="z-50 max-w-56 rounded-xl border bg-popover p-3 text-popover-foreground shadow-md outline-none"
            >
              <div className="flex flex-wrap gap-2">
                {hiddenColors.map((color) => (
                  <Badge key={color} variant="outline">
                    {LIST_COLOR_LABELS[color]}
                  </Badge>
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      ) : null}
    </div>
  )
}

function ListDescription({ description }: { description: string | null }) {
  if (!description) {
    return <span className="text-muted-foreground">—</span>
  }

  const shouldPreview = description.length > 52

  if (!shouldPreview) {
    return <span className="block max-w-[220px] truncate text-muted-foreground">{description}</span>
  }

  return (
    <HoverCardRoot openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span className="block max-w-[220px] cursor-help truncate text-muted-foreground">
          {description}
        </span>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-[320px]">
        <p className="text-sm leading-6 text-foreground">{description}</p>
      </HoverCardContent>
    </HoverCardRoot>
  )
}
