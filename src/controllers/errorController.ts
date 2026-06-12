import type { AxiosError } from "axios"

export function getErrorMessage(error: unknown, fallback = "Algo deu errado") {
  if (error instanceof Error && error.message) return error.message

  const axiosError = error as AxiosError<{ message?: string; error_description?: string }>
  const data = axiosError?.response?.data
  return data?.message ?? data?.error_description ?? fallback
}

