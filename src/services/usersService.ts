import { supabaseHttp } from "./supabaseHttp"

import type { UserRecord } from "@/types/auth"

type CreateUserInput = Omit<UserRecord, "id" | "pro"> & Partial<Pick<UserRecord, "id" | "pro">>

export async function getUserByIdentifier(identifier: string) {
  const normalized = identifier.trim()
  if (normalized.includes("@")) {
    const byEmail =
      (await getUserByEmail(normalized)) ??
      (await getUserByEmailIlike(normalized))

    return byEmail
  }

  const byNickname =
    (await getUserByNickname(normalized)) ??
    (await getUserByNicknameIlike(normalized))

  return byNickname
}

export async function getUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  const { data } = await supabaseHttp.get<UserRecord[]>("users", {
    params: {
      select: "id,name,email,nickname,password,pro",
      email: `eq.${normalized}`,
      limit: 1,
    },
  })

  return data?.[0] ?? null
}

export async function getUserByEmailIlike(email: string) {
  const normalized = email.trim()
  const { data } = await supabaseHttp.get<UserRecord[]>("users", {
    params: {
      select: "id,name,email,nickname,password,pro",
      email: `ilike.${normalized}`,
      limit: 1,
    },
  })

  return data?.[0] ?? null
}

export async function getUserByNickname(nickname: string) {
  const normalized = nickname.trim()
  const { data } = await supabaseHttp.get<UserRecord[]>("users", {
    params: {
      select: "id,name,email,nickname,password,pro",
      nickname: `eq.${normalized}`,
      limit: 1,
    },
  })

  return data?.[0] ?? null
}

export async function getUserByNicknameIlike(nickname: string) {
  const normalized = nickname.trim()
  const { data } = await supabaseHttp.get<UserRecord[]>("users", {
    params: {
      select: "id,name,email,nickname,password,pro",
      nickname: `ilike.${normalized}`,
      limit: 1,
    },
  })

  return data?.[0] ?? null
}

export async function createUser(input: CreateUserInput) {
  const payload: UserRecord = {
    id: input.id ?? crypto.randomUUID(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    nickname: input.nickname.trim(),
    password: input.password,
    pro: input.pro ?? false,
  }

  const { data } = await supabaseHttp.post<UserRecord[]>("users", payload, {
    headers: { Prefer: "return=representation" },
  })

  return data?.[0] ?? null
}

export async function getProUsers() {
  const { data } = await supabaseHttp.get<Array<Pick<UserRecord, "id" | "pro">>>("users", {
    params: {
      select: "id,pro",
      pro: "is.true",
    },
  })

  return data ?? []
}
