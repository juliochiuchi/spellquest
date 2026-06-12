import type { TypeList } from "@/types/mtg"
import { supabaseHttp } from "./supabaseHttp"

const TABLE = "types_list"

export async function getTypeLists() {
  const { data } = await supabaseHttp.get<TypeList[]>(TABLE, {
    params: { select: "*", order: "name.asc" },
  })
  return data
}

export async function createTypeList(input: Omit<TypeList, "id">) {
  const { data } = await supabaseHttp.post<TypeList[]>(TABLE, input, {
    headers: { Prefer: "return=representation" },
  })
  return data?.[0]
}

export async function updateTypeList(id: string, input: Partial<Omit<TypeList, "id">>) {
  const { data } = await supabaseHttp.patch<TypeList[]>(
    TABLE,
    input,
    { params: { id: `eq.${id}` }, headers: { Prefer: "return=representation" } }
  )
  return data?.[0]
}

export async function deleteTypeList(id: string) {
  await supabaseHttp.delete(TABLE, { params: { id: `eq.${id}` } })
}
