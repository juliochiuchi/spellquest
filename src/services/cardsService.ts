import type { Card } from "@/types/mtg"
import { supabaseHttp } from "./supabaseHttp"

export async function getCardsByListId(listId: string) {
  const { data } = await supabaseHttp.get<Card[]>("cards", {
    params: { select: "*", list_id: `eq.${listId}`, order: "name.asc" },
  })
  return data
}

export async function createCard(input: Omit<Card, "id">) {
  const { data } = await supabaseHttp.post<Card[]>("cards", input, {
    headers: { Prefer: "return=representation" },
  })
  return data?.[0]
}

export async function updateCard(id: string, input: Partial<Omit<Card, "id">>) {
  const { data } = await supabaseHttp.patch<Card[]>(
    "cards",
    input,
    { params: { id: `eq.${id}` }, headers: { Prefer: "return=representation" } }
  )
  return data?.[0]
}

export async function deleteCard(id: string) {
  await supabaseHttp.delete("cards", { params: { id: `eq.${id}` } })
}
