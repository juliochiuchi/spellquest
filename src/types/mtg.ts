import type { ListColor } from "@/constants/list-colors"

export type TypeList = {
  id: string
  name: string
}

export type List = {
  id: string
  user_id: string | null
  type_id: string
  name_list: string
  name_grimoire: string | null
  description: string | null
  colors: ListColor[]
  private: boolean
}

export type Card = {
  id: string
  list_id: string
  name: string
  edition: string
  quantity: number
  url_image: string | null
  is_purchased: boolean
}
