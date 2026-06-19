import * as React from "react"

import { toast } from "@/components/ui/use-toast"
import { getAuthUser } from "@/controllers/authController"
import * as cardsController from "@/controllers/cardsController"
import { getErrorMessage } from "@/controllers/errorController"
import * as listsController from "@/controllers/listsController"
import * as typeListController from "@/controllers/typeListController"
import { MtgContext, type CreateListInput, type MtgContextValue } from "@/contexts/mtg-store"
import * as usersService from "@/services/usersService"
import type { Card, List, TypeList } from "@/types/mtg"

type CardsByListId = Record<string, Card[] | undefined>

export function MtgProvider({ children }: { children: React.ReactNode }) {
  const [typeLists, setTypeLists] = React.useState<TypeList[]>([])
  const [lists, setLists] = React.useState<List[]>([])
  const [cardsByListId, setCardsByListId] = React.useState<CardsByListId>({})

  const [isLoadingTypes, setIsLoadingTypes] = React.useState(false)
  const [isLoadingLists, setIsLoadingLists] = React.useState(false)
  const [loadingCardsByListId, setLoadingCardsByListId] = React.useState<Record<string, boolean>>({})

  const [error, setError] = React.useState<string | null>(null)

  const notifyError = React.useCallback((title: string, e: unknown) => {
    const message = getErrorMessage(e)
    toast({ title, description: message, variant: "destructive" })
    setError(message)
  }, [])

  const notifySuccess = React.useCallback((title: string, description?: string) => {
    toast({ title, description, variant: "success" })
  }, [])

  const isLoadingCards = React.useCallback(
    (listId: string) => Boolean(loadingCardsByListId[listId]),
    [loadingCardsByListId]
  )

  const refreshTypeLists = React.useCallback(async () => {
    setError(null)
    setIsLoadingTypes(true)
    try {
      const data = await typeListController.listTypeLists()
      setTypeLists(data ?? [])
    } catch (e) {
      notifyError("Erro ao carregar tipos", e)
    } finally {
      setIsLoadingTypes(false)
    }
  }, [notifyError])

  const refreshLists = React.useCallback(async () => {
    setError(null)
    setIsLoadingLists(true)
    try {
      const [data, proUsers] = await Promise.all([
        listsController.listListsFiltered({ privateFlag: false }),
        usersService.getProUsers(),
      ])
      const proUserIds = new Set(proUsers.map((user) => user.id))
      setLists((data ?? []).filter((list) => Boolean(list.user_id) && proUserIds.has(list.user_id as string)))
    } catch (e) {
      notifyError("Erro ao carregar listas", e)
    } finally {
      setIsLoadingLists(false)
    }
  }, [notifyError])

  const refreshCards = React.useCallback(async (listId: string) => {
    setError(null)
    setLoadingCardsByListId((s) => ({ ...s, [listId]: true }))
    try {
      const data = await cardsController.listCardsByListId(listId)
      setCardsByListId((s) => ({ ...s, [listId]: data ?? [] }))
    } catch (e) {
      notifyError("Erro ao carregar cartas", e)
    } finally {
      setLoadingCardsByListId((s) => ({ ...s, [listId]: false }))
    }
  }, [notifyError])

  const createTypeList = React.useCallback(
    async (input: Omit<TypeList, "id">) => {
      setError(null)
      try {
        const created = await typeListController.createTypeList(input)
        if (created) {
          setTypeLists((s) => [...s, created].sort((a, b) => a.name.localeCompare(b.name)))
          notifySuccess("Tipo criado", created.name)
        }
      } catch (e) {
        notifyError("Erro ao criar tipo", e)
      }
    },
    [notifyError, notifySuccess]
  )

  const updateTypeList = React.useCallback(async (id: string, input: Partial<Omit<TypeList, "id">>) => {
    setError(null)
    try {
      const updated = await typeListController.updateTypeList(id, input)
      if (!updated) return
      setTypeLists((s) => s.map((t) => (t.id === id ? updated : t)).sort((a, b) => a.name.localeCompare(b.name)))
      notifySuccess("Tipo atualizado", updated.name)
    } catch (e) {
      notifyError("Erro ao atualizar tipo", e)
    }
  }, [notifyError, notifySuccess])

  const deleteTypeList = React.useCallback(async (id: string) => {
    setError(null)
    try {
      await typeListController.deleteTypeList(id)
      setTypeLists((s) => s.filter((t) => t.id !== id))
      notifySuccess("Tipo removido")
    } catch (e) {
      notifyError("Erro ao remover tipo", e)
    }
  }, [notifyError, notifySuccess])

  const createList = React.useCallback(async (input: CreateListInput) => {
    setError(null)
    try {
      const authUser = getAuthUser()
      const created = await listsController.createList({
        user_id: authUser?.id ?? null,
        private: input.private ?? false,
        type_id: input.type_id,
        name_list: input.name_list,
        name_grimoire: input.name_grimoire,
        description: input.description,
        colors: input.colors,
      })
      if (created) {
        setLists((s) => [...s, created].sort((a, b) => a.name_list.localeCompare(b.name_list)))
        notifySuccess("Lista criada", created.name_list)
      }
    } catch (e) {
      notifyError("Erro ao criar lista", e)
    }
  }, [notifyError, notifySuccess])

  const updateList = React.useCallback(async (id: string, input: Partial<Omit<List, "id">>) => {
    setError(null)
    try {
      const updated = await listsController.updateList(id, input)
      if (!updated) return
      setLists((s) => s.map((l) => (l.id === id ? updated : l)).sort((a, b) => a.name_list.localeCompare(b.name_list)))
      notifySuccess("Lista atualizada", updated.name_list)
    } catch (e) {
      notifyError("Erro ao atualizar lista", e)
    }
  }, [notifyError, notifySuccess])

  const deleteList = React.useCallback(async (id: string) => {
    setError(null)
    try {
      await listsController.deleteList(id)
      setLists((s) => s.filter((l) => l.id !== id))
      setCardsByListId((s) => {
        const next = { ...s }
        delete next[id]
        return next
      })
      notifySuccess("Lista removida")
    } catch (e) {
      notifyError("Erro ao remover lista", e)
    }
  }, [notifyError, notifySuccess])

  const createCard = React.useCallback(async (input: Omit<Card, "id">) => {
    setError(null)
    try {
      const created = await cardsController.createCard(input)
      if (!created) return
      setCardsByListId((s) => {
        const prev = s[input.list_id] ?? []
        const next = [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
        return { ...s, [input.list_id]: next }
      })
      notifySuccess("Carta adicionada", created.name)
    } catch (e) {
      notifyError("Erro ao adicionar carta", e)
    }
  }, [notifyError, notifySuccess])

  const updateCard = React.useCallback(async (id: string, input: Partial<Omit<Card, "id">>) => {
    setError(null)
    try {
      const updated = await cardsController.updateCard(id, input)
      if (!updated) return
      setCardsByListId((s) => {
        const listId = updated.list_id
        const prev = s[listId] ?? []
        const next = prev.map((c) => (c.id === id ? updated : c)).sort((a, b) => a.name.localeCompare(b.name))
        return { ...s, [listId]: next }
      })
      notifySuccess("Carta atualizada", updated.name)
    } catch (e) {
      notifyError("Erro ao atualizar carta", e)
    }
  }, [notifyError, notifySuccess])

  const deleteCard = React.useCallback(async (id: string, listId: string) => {
    setError(null)
    try {
      await cardsController.deleteCard(id)
      setCardsByListId((s) => {
        const prev = s[listId] ?? []
        return { ...s, [listId]: prev.filter((c) => c.id !== id) }
      })
      notifySuccess("Carta removida")
    } catch (e) {
      notifyError("Erro ao remover carta", e)
    }
  }, [notifyError, notifySuccess])

  React.useEffect(() => {
    queueMicrotask(() => {
      refreshTypeLists()
      refreshLists()
    })
  }, [refreshLists, refreshTypeLists])

  const value = React.useMemo<MtgContextValue>(
    () => ({
      typeLists,
      lists,
      cardsByListId,
      isLoadingTypes,
      isLoadingLists,
      isLoadingCards,
      error,
      refreshTypeLists,
      refreshLists,
      refreshCards,
      createTypeList,
      updateTypeList,
      deleteTypeList,
      createList,
      updateList,
      deleteList,
      createCard,
      updateCard,
      deleteCard,
    }),
    [
      typeLists,
      lists,
      cardsByListId,
      isLoadingTypes,
      isLoadingLists,
      isLoadingCards,
      error,
      refreshTypeLists,
      refreshLists,
      refreshCards,
      createTypeList,
      updateTypeList,
      deleteTypeList,
      createList,
      updateList,
      deleteList,
      createCard,
      updateCard,
      deleteCard,
    ]
  )

  return <MtgContext.Provider value={value}>{children}</MtgContext.Provider>
}
