import * as cardsService from "@/services/cardsService"
import type { Card } from "@/types/mtg"

export async function listCardsByListId(listId: string) {
  return cardsService.getCardsByListId(listId)
}

export async function createCard(input: Omit<Card, "id">) {
  return cardsService.createCard(input)
}

export async function updateCard(id: string, input: Partial<Omit<Card, "id">>) {
  return cardsService.updateCard(id, input)
}

export async function deleteCard(id: string) {
  return cardsService.deleteCard(id)
}

export function getDistinctEditions(cards: Card[]) {
  const set = new Set<string>()
  for (const c of cards) {
    const edition = c.edition?.trim()
    if (edition) set.add(edition)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

