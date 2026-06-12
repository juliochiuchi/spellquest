import type { TypeList } from "@/types/mtg"
import * as typeListService from "@/services/typeListService"

export async function listTypeLists() {
  return typeListService.getTypeLists()
}

export async function createTypeList(input: Omit<TypeList, "id">) {
  return typeListService.createTypeList(input)
}

export async function updateTypeList(id: string, input: Partial<Omit<TypeList, "id">>) {
  return typeListService.updateTypeList(id, input)
}

export async function deleteTypeList(id: string) {
  return typeListService.deleteTypeList(id)
}

