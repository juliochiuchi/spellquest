import { createFileRoute } from "@tanstack/react-router"
import { CircleDashed, CircleCheckBig, Loader2, RefreshCw } from "lucide-react"
import * as React from "react"

import * as cardsController from "@/controllers/cardsController"
import { formatCardsForLigaMagic, formatCardForLigaMagic } from "@/controllers/ligaMagicController"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card as CardUi, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DialogContent, DialogHeader, DialogRoot, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { LoadingReveal } from "@/components/ui/loading-reveal"
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CardImageTrigger } from "@/contexts/components/card-image-trigger"
import { CopyToClipboardButton } from "@/contexts/components/copy-to-clipboard-button"
import { PageShell } from "@/contexts/components/page-shell"
import { useMtg } from "@/contexts/mtg-store"
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
  } = useMtg()

  const list = React.useMemo(() => lists.find((l) => l.id === listId) ?? null, [listId, lists])
  const cards = React.useMemo(() => cardsByListId[listId] ?? [], [cardsByListId, listId])

  React.useEffect(() => {
    queueMicrotask(() => {
      refreshCards(listId)
    })
  }, [listId, refreshCards])

  const [previewCard, setPreviewCard] = React.useState<Card | null>(null)

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
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <CopyToClipboardButton
            text={formatCardsForLigaMagic(cards)}
            label="Copiar lista inteira"
            showLabel
            disabled={cards.length === 0}
            className="w-full sm:w-auto"
          />
          <CopyToClipboardButton
            text={formatCardsForLigaMagic(selectedCards)}
            label="Copiar cartas selecionadas"
            showLabel
            disabled={selectedCards.length === 0}
            className="w-full sm:w-auto"
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
              <Button className="w-full sm:w-auto" variant="outline" onClick={() => refreshCards(listId)} disabled={isLoadingCards(listId)}>
                {isLoadingCards(listId) ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                {isLoadingCards(listId) ? "Atualizando..." : "Atualizar"}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-background/50 px-3 py-2">
              <div className="flex items-center gap-2">
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
                <span className="text-sm font-medium">Selecionar visíveis</span>
              </div>
              <span className="text-sm text-muted-foreground">{selectedCards.length} carta(s) selecionada(s)</span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid gap-3 p-4 md:hidden">
              {visibleCards.map((c) => (
                <div key={c.id} className="rounded-xl border border-border/70 bg-background/60 p-4 shadow-sm shadow-black/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={Boolean(selectedIds[c.id])}
                          onCheckedChange={(checked) =>
                            setSelectedIdsByListId((s) => ({
                              ...s,
                              [listId]: { ...(s[listId] ?? {}), [c.id]: Boolean(checked) },
                            }))
                          }
                        />
                        <div className="truncate text-sm font-medium">{c.name}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="muted">{c.edition}</Badge>
                        <Badge variant={c.is_purchased ? "secondary" : "muted"} className="gap-1.5">
                          {c.is_purchased ? <CircleCheckBig className="size-3.5" /> : <CircleDashed className="size-3.5" />}
                          {c.is_purchased ? "Comprada" : "Pendente"}
                        </Badge>
                        <Badge variant="muted">Qtd {c.quantity}</Badge>
                      </div>
                    </div>

                    {c.url_image ? <CardImageTrigger name={c.name} url={c.url_image} onOpen={() => setPreviewCard(c)} /> : null}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <CopyToClipboardButton
                      text={formatCardForLigaMagic(c)}
                      label="Copiar carta"
                      showLabel
                      className="flex-1 sm:flex-none"
                    />
                  </div>
                </div>
              ))}

              {visibleCards.length === 0 && !isLoadingCards(listId) ? (
                <div className="rounded-xl border border-border/70 bg-background/40 px-4 py-10 text-center text-sm text-muted-foreground">
                  Nenhuma carta encontrada para esse filtro.
                </div>
              ) : null}
            </div>

            <div className="hidden w-full overflow-x-auto md:block">
              <Table className="w-full table-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[48px]">
                      <span className="sr-only">Selecionar visíveis</span>
                    </TableHead>
                    <TableHead className="w-full min-w-[320px]">Nome</TableHead>
                    <TableHead className="w-[140px]">Edição</TableHead>
                    <TableHead className="w-[120px]">Compra</TableHead>
                    <TableHead className="w-[72px] text-right">Qtd</TableHead>
                    <TableHead className="w-[220px] text-right">Ações</TableHead>
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
                      <TableCell className="w-full min-w-[320px]">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0 font-medium">
                            <div className="truncate">{c.name}</div>
                          </div>
                          {c.url_image ? <CardImageTrigger name={c.name} url={c.url_image} onOpen={() => setPreviewCard(c)} /> : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="muted">{c.edition}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={c.is_purchased ? "secondary" : "muted"}
                          className="gap-1.5"
                        >
                          {c.is_purchased ? <CircleCheckBig className="size-3.5" /> : <CircleDashed className="size-3.5" />}
                          {c.is_purchased ? "Comprada" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{c.quantity}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <CopyToClipboardButton text={formatCardForLigaMagic(c)} label="Copiar carta" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {visibleCards.length === 0 && !isLoadingCards(listId) ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
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

      <DialogRoot open={Boolean(previewCard)} onOpenChange={(next) => {
        if (!next) setPreviewCard(null)
      }}>
        <DialogContent className="max-w-sm p-4">
          {previewCard ? (
            <>
              <DialogHeader>
                <DialogTitle>{previewCard.name}</DialogTitle>
              </DialogHeader>
              <div className="mt-6 overflow-hidden rounded-xl border border-border/70 bg-background/60">
                <img
                  src={previewCard.url_image ?? ""}
                  alt={previewCard.name}
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />
              </div>
            </>
          ) : null}
        </DialogContent>
      </DialogRoot>
    </PageShell>
  )
}
