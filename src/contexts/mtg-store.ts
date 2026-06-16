import * as React from "react"

import type { Card, List, TypeList } from "@/types/mtg"

type CardsByListId = Record<string, Card[] | undefined>

export type CreateListInput = Omit<List, "id" | "user_id" | "private"> & Partial<Pick<List, "private">>

export type MtgContextValue = {
  typeLists: TypeList[]
  lists: List[]
  cardsByListId: CardsByListId
  isLoadingTypes: boolean
  isLoadingLists: boolean
  isLoadingCards: (listId: string) => boolean
  error: string | null
  refreshTypeLists: () => Promise<void>
  refreshLists: () => Promise<void>
  refreshCards: (listId: string) => Promise<void>
  createTypeList: (input: Omit<TypeList, "id">) => Promise<void>
  updateTypeList: (id: string, input: Partial<Omit<TypeList, "id">>) => Promise<void>
  deleteTypeList: (id: string) => Promise<void>
  createList: (input: CreateListInput) => Promise<void>
  updateList: (id: string, input: Partial<Omit<List, "id" | "user_id">>) => Promise<void>
  deleteList: (id: string) => Promise<void>
  createCard: (input: Omit<Card, "id">) => Promise<void>
  updateCard: (id: string, input: Partial<Omit<Card, "id">>) => Promise<void>
  deleteCard: (id: string, listId: string) => Promise<void>
}

export const MtgContext = React.createContext<MtgContextValue | null>(null)

export function useMtg() {
  const ctx = React.useContext(MtgContext)
  if (!ctx) throw new Error("useMtg deve ser usado dentro de MtgProvider")
  return ctx
}
