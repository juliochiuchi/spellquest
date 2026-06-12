import type { List } from "@/types/mtg"
import { supabaseHttp } from "./supabaseHttp"

export async function getLists() {
  const { data } = await supabaseHttp.get<List[]>("lists", {
    params: { select: "*", order: "name_list.asc" },
  })
  return data
}

export async function createList(input: Omit<List, "id">) {
  const { data } = await supabaseHttp.post<List[]>("lists", input, {
    headers: { Prefer: "return=representation" },
  })
  return data?.[0]
}

export async function updateList(id: string, input: Partial<Omit<List, "id">>) {
  const { data } = await supabaseHttp.patch<List[]>(
    "lists",
    input,
    { params: { id: `eq.${id}` }, headers: { Prefer: "return=representation" } }
  )
  return data?.[0]
}

export async function deleteList(id: string) {
  await supabaseHttp.delete("lists", { params: { id: `eq.${id}` } })
}
