import type { List } from "@/types/mtg"
import { supabase } from "./supabaseClient"
import { supabaseHttp } from "./supabaseHttp"

export async function getLists({
  userId,
  privateFlag,
}: {
  userId?: string | null
  privateFlag?: boolean | null
} = {}) {
  const params: Record<string, string> = { select: "*", order: "name_list.asc" }

  if (userId) {
    params.user_id = `eq.${userId}`
  }

  if (typeof privateFlag === "boolean") {
    params["private"] = `is.${privateFlag}`
  }

  const { data } = await supabaseHttp.get<List[]>("lists", {
    params,
  })
  return data
}

export async function getListById(id: string) {
  const { data } = await supabaseHttp.get<List[]>("lists", {
    params: { select: "*", id: `eq.${id}`, limit: 1 },
  })
  return data?.[0] ?? null
}

export async function getListsCount() {
  const { count, error } = await supabase.from("lists").select("id", { count: "exact", head: true })
  if (error) throw error
  return count ?? 0
}

export async function getGrimoireCount() {
  const { count, error } = await supabase.from("lists").select("id", { count: "exact", head: true }).not("name_grimoire", "is", null)
  if (error) throw error
  return count ?? 0
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
