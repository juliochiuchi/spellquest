import * as listsService from "@/services/listsService"
import type { List } from "@/types/mtg"

export async function listLists() {
  return listsService.getLists()
}

export async function createList(input: Omit<List, "id">) {
  return listsService.createList(input)
}

export async function updateList(id: string, input: Partial<Omit<List, "id">>) {
  return listsService.updateList(id, input)
}

export async function deleteList(id: string) {
  return listsService.deleteList(id)
}

