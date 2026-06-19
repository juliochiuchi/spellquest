import { z } from "zod"

import { LIST_COLOR_VALUES } from "@/constants/list-colors"

const fieldLimitMessage = "Use no maximo 30 caracteres"

export const listFormSchema = z.object({
  type_id: z.uuid(),
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
  colors: z.array(z.enum(LIST_COLOR_VALUES)).min(1, "Selecione ao menos uma cor"),
  private: z.boolean(),
})

export type ListFormValues = z.infer<typeof listFormSchema>

export const cardFormSchema = z.object({
  name: z.string().trim().min(1),
  edition: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(1),
  is_purchased: z.boolean(),
  url_image: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .nullable(),
})

export type CardFormValues = z.infer<typeof cardFormSchema>

export const loginFormSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail ou nickname")
    .max(30, fieldLimitMessage),
  password: z
    .string()
    .min(1, "Informe sua senha")
    .max(30, fieldLimitMessage),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>

export const registerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Informe seu nome")
      .max(30, fieldLimitMessage),
    email: z
      .string()
      .trim()
      .min(1, "Informe seu e-mail")
      .max(30, fieldLimitMessage)
      .pipe(z.email("Informe um e-mail valido")),
    nickname: z
      .string()
      .trim()
      .min(1, "Informe seu nickname")
      .max(30, fieldLimitMessage),
    password: z
      .string()
      .min(1, "Informe sua senha")
      .max(30, fieldLimitMessage),
    confirmPassword: z
      .string()
      .min(1, "Repita sua senha")
      .max(30, fieldLimitMessage),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "As senhas precisam ser iguais",
    path: ["confirmPassword"],
  })

export type RegisterFormValues = z.infer<typeof registerFormSchema>
