import { createFileRoute } from "@tanstack/react-router"
import { Pencil, Plus, Trash2 } from "lucide-react"
import * as React from "react"

import * as cardsController from "@/controllers/cardsController"
import { formatCardsForLigaMagic, formatCardForLigaMagic } from "@/controllers/ligaMagicController"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card as CardUi, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { HoverCardContent, HoverCardRoot, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { LoadingReveal } from "@/components/ui/loading-reveal"
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CopyToClipboardButton } from "@/contexts/components/copy-to-clipboard-button"
import { CardFormDialog } from "@/contexts/components/forms/card-form-dialog"
import { PageShell } from "@/contexts/components/page-shell"
import { useMtg } from "@/contexts/mtg-context"
import type { Card } from "@/types/mtg"

export const Route = createFileRoute("/_app/lists/$listId")({
  component: ListDetailPage,
})

function ListDetailPage() {
  const { listId } = Route.useParams()
  const {
    lists,
    typeLists,
    cardsByListId,
    error,
    isLoadingCards,
    refreshCards,
    createCard,
    updateCard,
    deleteCard,
  } = useMtg()

  const list = React.useMemo(() => lists.find((l) => l.id === listId) ?? null, [listId, lists])
  const cards = cardsByListId[listId] ?? []

  React.useEffect(() => {
    refreshCards(listId)
  }, [listId, refreshCards])

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Card | null>(null)

  const [editionFilter, setEditionFilter] = React.useState<string>("__all__")
  const [search, setSearch] = React.useState("")

  const typeName = React.useMemo(() => typeLists.find((t) => t.id === list?.type_id)?.name ?? "—", [list, typeLists])
  const editions = React.useMemo(() => cardsController.getDistinctEditions(cards), [cards])

  const visibleCards = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return cards.filter((c) => {
      if (editionFilter !== "__all__" && c.edition !== editionFilter) return false
      if (!q) return true
      return c.name.toLowerCase().includes(q) || c.edition.toLowerCase().includes(q)
    })
  }, [cards, editionFilter, search])

  const [selectedIdsByListId, setSelectedIdsByListId] = React.useState<Record<string, Record<string, boolean>>>({})
  const selectedIds = selectedIdsByListId[listId] ?? {}

  const allVisibleSelected = visibleCards.length > 0 && visibleCards.every((c) => selectedIds[c.id])
  const selectedCards = visibleCards.filter((c) => selectedIds[c.id])

  return (
    <PageShell
      title={list?.name_list ?? "Lista"}
      description={list ? `${typeName}${list.name_grimoire ? ` • Grimório: ${list.name_grimoire}` : ""}` : "—"}
      actions={
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
          >
            <Plus className="size-4" />
            Nova carta
          </Button>
          <CopyToClipboardButton text={formatCardsForLigaMagic(cards)} label="Copiar lista" disabled={cards.length === 0} />
          <CopyToClipboardButton
            text={formatCardsForLigaMagic(selectedCards)}
            label="Copiar selecionadas"
            disabled={selectedCards.length === 0}
          />
        </div>
      }
    >
      {error ? <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">{error}</div> : null}

      <LoadingReveal isLoading={isLoadingCards(listId)} label="Carregando cartas...">
        <CardUi>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Cartas</CardTitle>
              <div className="text-sm text-muted-foreground">
                {isLoadingCards(listId) ? "Carregando..." : `${cards.length} carta(s)`}
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <div className="w-full sm:w-56">
                <Input placeholder="Buscar por nome/edição..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="w-full sm:w-48">
                <SelectRoot value={editionFilter} onValueChange={setEditionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por edição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todas as edições</SelectItem>
                    {editions.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </div>
              <Button variant="outline" onClick={() => refreshCards(listId)} disabled={isLoadingCards(listId)}>
                Atualizar
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[48px]">
                      <Checkbox
                        checked={allVisibleSelected}
                        onCheckedChange={(checked) => {
                          const next = Boolean(checked)
                          setSelectedIdsByListId((s) => {
                            const prev = s[listId] ?? {}
                            const copy = { ...prev }
                            for (const c of visibleCards) copy[c.id] = next
                            return { ...s, [listId]: copy }
                          })
                        }}
                      />
                    </TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Edição</TableHead>
                    <TableHead className="w-[90px] text-right">Qtd</TableHead>
                    <TableHead className="w-[200px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleCards.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Checkbox
                          checked={Boolean(selectedIds[c.id])}
                          onCheckedChange={(checked) =>
                            setSelectedIdsByListId((s) => ({
                              ...s,
                              [listId]: { ...(s[listId] ?? {}), [c.id]: Boolean(checked) },
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {c.url_image ? (
                          <HoverCardRoot openDelay={140}>
                            <HoverCardTrigger asChild>
                              <button type="button" className="text-left hover:underline">
                                {c.name}
                              </button>
                            </HoverCardTrigger>
                            <HoverCardContent side="right" align="start" sideOffset={12} className="w-[260px] p-2">
                              <img
                                src={c.url_image}
                                alt={c.name}
                                className="h-auto w-full rounded-lg border object-cover"
                                loading="lazy"
                              />
                            </HoverCardContent>
                          </HoverCardRoot>
                        ) : (
                          c.name
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="muted">{c.edition}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{c.quantity}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <CopyToClipboardButton text={formatCardForLigaMagic(c)} label="Copiar carta" />
                          <Button
                            size="icon-sm"
                            variant="outline"
                            onClick={() => {
                              setEditing(c)
                              setOpen(true)
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <ConfirmDialog
                            title="Excluir carta?"
                            description={`Essa ação remove "${c.name}" da lista e não pode ser desfeita.`}
                            confirmLabel="Excluir"
                            destructive
                            onConfirm={() => deleteCard(c.id, listId)}
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

                  {visibleCards.length === 0 && !isLoadingCards(listId) ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        Nenhuma carta encontrada para esse filtro.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </CardUi>
      </LoadingReveal>

      <CardFormDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        editionSuggestions={editions}
        onSubmit={async (values) => {
          if (editing) {
            await updateCard(editing.id, {
              name: values.name,
              edition: values.edition,
              quantity: values.quantity,
              url_image: values.url_image,
            })
            return
          }

          await createCard({
            list_id: listId,
            name: values.name,
            edition: values.edition,
            quantity: values.quantity,
            url_image: values.url_image,
          })
        }}
      />
    </PageShell>
  )
}
