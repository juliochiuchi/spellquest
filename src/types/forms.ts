import { z } from "zod"

export const listFormSchema = z.object({
  type_id: z.string().uuid(),
  name_list: z.string().trim().min(1),
  name_grimoire: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .nullable(),
  description: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .nullable(),
})

export type ListFormValues = z.infer<typeof listFormSchema>

export const cardFormSchema = z.object({
  name: z.string().trim().min(1),
  edition: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(1),
  url_image: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .nullable(),
})

export type CardFormValues = z.infer<typeof cardFormSchema>

