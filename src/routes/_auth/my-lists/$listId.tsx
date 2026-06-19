import { createFileRoute, redirect } from "@tanstack/react-router"
import { ArrowRightLeft, CheckCheck, CircleDashed, CircleCheckBig, Loader2, Pencil, Plus, RefreshCw, RotateCcw, Trash2 } from "lucide-react"
import * as React from "react"

import * as cardsController from "@/controllers/cardsController"
import { getErrorMessage } from "@/controllers/errorController"
import { formatCardsForLigaMagic, formatCardForLigaMagic } from "@/controllers/ligaMagicController"
import * as listsController from "@/controllers/listsController"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card as CardUi, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingReveal } from "@/components/ui/loading-reveal"
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { CopyToClipboardButton } from "@/contexts/components/copy-to-clipboard-button"
import { CardImageTrigger } from "@/contexts/components/card-image-trigger"
import { CardFormDialog } from "@/contexts/components/forms/card-form-dialog"
import { PageShell } from "@/contexts/components/page-shell"
import { useAuth } from "@/contexts/auth-context"
import { useMtg } from "@/contexts/mtg-store"
import type { Card, List } from "@/types/mtg"

export const Route = createFileRoute("/_auth/my-lists/$listId")({
  beforeLoad: async ({ params }) => {
    const list = await listsController.getListById(params.listId)
    if (!list) throw redirect({ to: "/my-lists" })
  },
  component: PrivateListDetailPage,
})

function PrivateListDetailPage() {
  const { listId } = Route.useParams()
  const { user } = useAuth()
  const { typeLists } = useMtg()

  const [list, setList] = React.useState<List | null>(null)
  const [cards, setCards] = React.useState<Card[]>([])
  const [isLoadingList, setIsLoadingList] = React.useState(false)
  const [isLoadingCards, setIsLoadingCards] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    setError(null)
    setIsLoadingList(true)
    setIsLoadingCards(true)
    try {
      const [nextList, nextCards] = await Promise.all([
        listsController.getListById(listId),
        cardsController.listCardsByListId(listId),
      ])

      if (!nextList) {
        setList(null)
        setCards([])
        return
      }

      if (user?.id && nextList.user_id !== user.id) {
        setList(null)
        setCards([])
        return
      }

      setList(nextList)
      setCards(nextCards ?? [])
    } catch (nextError) {
      const message = getErrorMessage(nextError, "Nao foi possivel carregar a lista")
      setError(message)
    } finally {
      setIsLoadingList(false)
      setIsLoadingCards(false)
    }
  }, [listId, user])

  const refreshCards = React.useCallback(async () => {
    setError(null)
    setIsLoadingCards(true)
    try {
      const nextCards = await cardsController.listCardsByListId(listId)
      setCards(nextCards ?? [])
    } catch (nextError) {
      const message = getErrorMessage(nextError, "Nao foi possivel carregar as cartas")
      setError(message)
    } finally {
      setIsLoadingCards(false)
    }
  }, [listId])

  React.useEffect(() => {
    queueMicrotask(() => {
      void refresh()
    })
  }, [refresh])

  React.useEffect(() => {
    if (!user?.id) {
      setUserLists([])
      return
    }

    let active = true
    setIsLoadingUserLists(true)

    void listsController
      .listListsFiltered({ userId: user.id })
      .then((nextLists) => {
        if (!active) return
        setUserLists(nextLists ?? [])
      })
      .catch((nextError) => {
        if (!active) return
        const message = getErrorMessage(nextError, "Nao foi possivel carregar as listas para transferencia")
        toast({ title: "Erro ao carregar listas", description: message, variant: "destructive" })
      })
      .finally(() => {
        if (!active) return
        setIsLoadingUserLists(false)
      })

    return () => {
      active = false
    }
  }, [user?.id])

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Card | null>(null)
  const [previewCard, setPreviewCard] = React.useState<Card | null>(null)
  const [transferCard, setTransferCard] = React.useState<Card | null>(null)
  const [transferTargetListId, setTransferTargetListId] = React.useState("")
  const [pendingCardActionId, setPendingCardActionId] = React.useState<string | null>(null)
  const [userLists, setUserLists] = React.useState<List[]>([])
  const [isLoadingUserLists, setIsLoadingUserLists] = React.useState(false)

  const [editionFilter, setEditionFilter] = React.useState<string>("__all__")
  const [search, setSearch] = React.useState("")

  const typeName = React.useMemo(() => typeLists.find((t) => t.id === list?.type_id)?.name ?? "—", [list, typeLists])
  const editions = React.useMemo(() => cardsController.getDistinctEditions(cards), [cards])
  const transferableLists = React.useMemo(() => userLists.filter((item) => item.id !== listId), [listId, userLists])

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

  const canManageCards = Boolean(user?.id && list?.user_id && user.id === list.user_id)

  const openTransferDialog = React.useCallback(
    (card: Card) => {
      setTransferCard(card)
      setTransferTargetListId(transferableLists[0]?.id ?? "")
    },
    [transferableLists]
  )

  const closeTransferDialog = React.useCallback(() => {
    setTransferCard(null)
    setTransferTargetListId("")
  }, [])

  return (
    <PageShell
      title={list?.name_list ?? "Lista"}
      description={list ? `${typeName}${list.name_grimoire ? ` • Grimório: ${list.name_grimoire}` : ""}` : "—"}
      actions={
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {canManageCards ? (
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setEditing(null)
                setOpen(true)
              }}
              disabled={!list}
            >
              <Plus className="size-4" />
              Nova carta
            </Button>
          ) : null}
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

      <LoadingReveal isLoading={isLoadingList || isLoadingCards} label="Carregando cartas...">
        <CardUi>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Cartas</CardTitle>
              <div className="text-sm text-muted-foreground">{isLoadingCards ? "Carregando..." : `${cards.length} carta(s)`}</div>
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
              <Button className="w-full sm:w-auto" variant="outline" onClick={() => void refreshCards()} disabled={isLoadingCards}>
                {isLoadingCards ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                {isLoadingCards ? "Atualizando..." : "Atualizar"}
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
                    {canManageCards ? (
                      <>
                        <Button
                          size="sm"
                          variant={c.is_purchased ? "secondary" : "outline"}
                          className="flex-1 sm:flex-none"
                          disabled={pendingCardActionId === c.id}
                          onClick={async () => {
                            try {
                              setPendingCardActionId(c.id)
                              const updated = await cardsController.updateCard(c.id, { is_purchased: !c.is_purchased })
                              if (!updated) return
                              setCards((current) => current.map((item) => (item.id === c.id ? updated : item)))
                            } catch (nextError) {
                              const message = getErrorMessage(nextError, "Nao foi possivel atualizar a carta")
                              toast({ title: "Erro ao atualizar carta", description: message, variant: "destructive" })
                            } finally {
                              setPendingCardActionId((current) => (current === c.id ? null : current))
                            }
                          }}
                        >
                          {pendingCardActionId === c.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : c.is_purchased ? (
                            <RotateCcw className="size-4" />
                          ) : (
                            <CheckCheck className="size-4" />
                          )}
                          {pendingCardActionId === c.id ? "Salvando..." : c.is_purchased ? "Pendente" : "Comprada"}
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="outline"
                          disabled={pendingCardActionId === c.id}
                          onClick={() => {
                            setEditing(c)
                            setOpen(true)
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pendingCardActionId === c.id || isLoadingUserLists}
                          onClick={() => openTransferDialog(c)}
                        >
                          <ArrowRightLeft className="size-4" />
                          Transferir
                        </Button>
                        <ConfirmDialog
                          title="Excluir carta?"
                          description={`Essa ação remove "${c.name}" da lista e não pode ser desfeita.`}
                          confirmLabel="Excluir"
                          destructive
                          onConfirm={async () => {
                            try {
                              await cardsController.deleteCard(c.id)
                              setCards((current) => current.filter((item) => item.id !== c.id))
                              toast({ title: "Carta removida", variant: "success" })
                            } catch (nextError) {
                              const message = getErrorMessage(nextError, "Nao foi possivel remover a carta")
                              toast({ title: "Erro ao remover carta", description: message, variant: "destructive" })
                            }
                          }}
                          trigger={
                            <Button size="icon-sm" variant="destructive">
                              <Trash2 className="size-4" />
                            </Button>
                          }
                        />
                      </>
                    ) : null}
                  </div>
                </div>
              ))}

              {visibleCards.length === 0 && !isLoadingCards ? (
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
                    <TableHead className="w-[320px] text-right">Ações</TableHead>
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
                      <TableCell className="min-w-[320px]">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0">
                            <div className="truncate font-medium">{c.name}</div>
                          </div>
                          {c.url_image ? (
                            <CardImageTrigger name={c.name} url={c.url_image} onOpen={() => setPreviewCard(c)} />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="muted">{c.edition}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.is_purchased ? "secondary" : "muted"} className="gap-1.5">
                          {c.is_purchased ? <CircleCheckBig className="size-3.5" /> : <CircleDashed className="size-3.5" />}
                          {c.is_purchased ? "Comprada" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{c.quantity}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <CopyToClipboardButton text={formatCardForLigaMagic(c)} label="Copiar" />
                          {canManageCards ? (
                            <>
                              <Button
                                size="icon-sm"
                                variant={c.is_purchased ? "secondary" : "outline"}
                                disabled={pendingCardActionId === c.id}
                                onClick={async () => {
                                  try {
                                    setPendingCardActionId(c.id)
                                    const updated = await cardsController.updateCard(c.id, { is_purchased: !c.is_purchased })
                                    if (!updated) return
                                    setCards((current) => current.map((item) => (item.id === c.id ? updated : item)))
                                  } catch (nextError) {
                                    const message = getErrorMessage(nextError, "Nao foi possivel atualizar a carta")
                                    toast({ title: "Erro ao atualizar carta", description: message, variant: "destructive" })
                                  } finally {
                                    setPendingCardActionId((current) => (current === c.id ? null : current))
                                  }
                                }}
                              >
                                {pendingCardActionId === c.id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : c.is_purchased ? (
                                  <RotateCcw className="size-4" />
                                ) : (
                                  <CheckCheck className="size-4" />
                                )}
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="outline"
                                disabled={pendingCardActionId === c.id}
                                onClick={() => {
                                  setEditing(c)
                                  setOpen(true)
                                }}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={pendingCardActionId === c.id || isLoadingUserLists}
                                onClick={() => openTransferDialog(c)}
                              >
                                <ArrowRightLeft className="size-4" />
                                Transferir
                              </Button>
                              <ConfirmDialog
                                title="Excluir carta?"
                                description={`Essa ação remove "${c.name}" da lista e não pode ser desfeita.`}
                                confirmLabel="Excluir"
                                destructive
                                onConfirm={async () => {
                                  try {
                                    await cardsController.deleteCard(c.id)
                                    setCards((current) => current.filter((item) => item.id !== c.id))
                                    toast({ title: "Carta removida", variant: "success" })
                                  } catch (nextError) {
                                    const message = getErrorMessage(nextError, "Nao foi possivel remover a carta")
                                    toast({ title: "Erro ao remover carta", description: message, variant: "destructive" })
                                  }
                                }}
                                trigger={
                                  <Button size="icon-sm" variant="destructive">
                                    <Trash2 className="size-4" />
                                  </Button>
                                }
                              />
                            </>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {visibleCards.length === 0 && !isLoadingCards ? (
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

      <CardFormDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        editionSuggestions={editions}
        onSubmit={async (values) => {
          if (!canManageCards) return

          try {
            if (editing) {
              const updated = await cardsController.updateCard(editing.id, {
                name: values.name,
                edition: values.edition,
                quantity: values.quantity,
                is_purchased: values.is_purchased,
                url_image: values.url_image,
              })

              if (updated) {
                setCards((current) => current.map((item) => (item.id === editing.id ? updated : item)))
                toast({ title: "Carta atualizada", variant: "success" })
              }
              return
            }

            const created = await cardsController.createCard({
              list_id: listId,
              name: values.name,
              edition: values.edition,
              quantity: values.quantity,
              is_purchased: values.is_purchased,
              url_image: values.url_image,
            })

            if (created) {
              setCards((current) => [...current, created])
              toast({ title: "Carta criada", variant: "success" })
            }
          } catch (nextError) {
            const message = getErrorMessage(nextError, "Nao foi possivel salvar a carta")
            toast({ title: "Erro ao salvar carta", description: message, variant: "destructive" })
          }
        }}
      />

      <DialogRoot
        open={Boolean(previewCard)}
        onOpenChange={(openValue) => {
          if (!openValue) setPreviewCard(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{previewCard?.name ?? "Carta"}</DialogTitle>
          </DialogHeader>
          {previewCard?.url_image ? (
            <div className="mt-6 overflow-hidden rounded-xl border border-border/70 bg-background/60">
              <img src={previewCard.url_image} alt={previewCard.name} className="w-full" />
            </div>
          ) : null}
        </DialogContent>
      </DialogRoot>

      <DialogRoot
        open={Boolean(transferCard)}
        onOpenChange={(openValue) => {
          if (!openValue) closeTransferDialog()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir carta</DialogTitle>
            <DialogDescription>
              Atualize a lista da carta para movê-la de "{list?.name_list ?? "Lista atual"}" para outra lista sua.
            </DialogDescription>
          </DialogHeader>

          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={async (event) => {
              event.preventDefault()

              if (!transferCard || !transferTargetListId) return

              const cardToTransfer = transferCard
              const nextListId = transferTargetListId
              const nextList = userLists.find((item) => item.id === nextListId)

              try {
                setPendingCardActionId(cardToTransfer.id)
                const updated = await cardsController.updateCard(cardToTransfer.id, { list_id: nextListId })
                if (!updated) return

                setCards((current) => current.filter((item) => item.id !== cardToTransfer.id))
                setSelectedIdsByListId((state) => {
                  const currentListSelections = state[listId]
                  if (!currentListSelections?.[cardToTransfer.id]) return state

                  const nextSelections = { ...currentListSelections }
                  delete nextSelections[cardToTransfer.id]

                  return { ...state, [listId]: nextSelections }
                })

                closeTransferDialog()
                toast({
                  title: "Carta transferida",
                  description: nextList ? `"${cardToTransfer.name}" foi enviada para "${nextList.name_list}".` : undefined,
                  variant: "success",
                })
              } catch (nextError) {
                const message = getErrorMessage(nextError, "Nao foi possivel transferir a carta")
                toast({ title: "Erro ao transferir carta", description: message, variant: "destructive" })
              } finally {
                setPendingCardActionId((current) => (current === cardToTransfer.id ? null : current))
              }
            }}
          >
            <div className="flex flex-col gap-2">
              <Label>De</Label>
              <SelectRoot value={list?.id ?? ""}>
                <SelectTrigger disabled>
                  <SelectValue placeholder="Lista atual" />
                </SelectTrigger>
                <SelectContent>
                  {list ? <SelectItem value={list.id}>{list.name_list}</SelectItem> : null}
                </SelectContent>
              </SelectRoot>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Para</Label>
              <SelectRoot value={transferTargetListId} onValueChange={setTransferTargetListId}>
                <SelectTrigger disabled={isLoadingUserLists || transferableLists.length === 0}>
                  <SelectValue
                    placeholder={
                      isLoadingUserLists ? "Carregando listas..." : transferableLists.length === 0 ? "Nenhuma lista disponivel" : "Selecione a lista"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {transferableLists.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name_list}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
              {transferableLists.length === 0 && !isLoadingUserLists ? (
                <p className="text-xs text-muted-foreground">Crie outra lista para transferir esta carta.</p>
              ) : null}
            </div>

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={closeTransferDialog} disabled={pendingCardActionId === transferCard?.id}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!transferTargetListId || pendingCardActionId === transferCard?.id}>
                {pendingCardActionId === transferCard?.id ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Transferindo...
                  </>
                ) : (
                  "Transferir"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogRoot>
    </PageShell>
  )
}
