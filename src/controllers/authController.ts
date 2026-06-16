import * as usersService from "@/services/usersService"
import { clearStoredAuthUser, getStoredAuthUser, setStoredAuthUser } from "@/services/authSession"
import type { LoginFormValues, RegisterFormValues } from "@/types/forms"
import type { AuthUser, UserRecord } from "@/types/auth"

function toAuthUser(user: UserRecord): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    nickname: user.nickname,
    pro: user.pro,
  }
}

export function getAuthUser() {
  return getStoredAuthUser()
}

export function logoutUser() {
  clearStoredAuthUser()
}

export async function loginUser(values: LoginFormValues) {
  const identifier = values.identifier.trim()
  const user = await usersService.getUserByIdentifier(identifier)

  if (!user) {
    throw new Error("Nao encontramos um usuario com este e-mail ou nickname")
  }

  if (user.password !== values.password) {
    throw new Error("Senha invalida")
  }

  const authUser = toAuthUser(user)
  setStoredAuthUser(authUser)
  return authUser
}

export async function registerUser(values: RegisterFormValues) {
  const email = values.email.trim().toLowerCase()
  const nickname = values.nickname.trim()

  const [existingEmailEq, existingEmailIlike, existingNicknameEq, existingNicknameIlike] = await Promise.all([
    usersService.getUserByEmail(email),
    usersService.getUserByEmailIlike(email),
    usersService.getUserByNickname(nickname),
    usersService.getUserByNicknameIlike(nickname),
  ])

  const existingEmail = existingEmailEq ?? existingEmailIlike
  const existingNickname = existingNicknameEq ?? existingNicknameIlike

  if (existingEmail) {
    throw new Error("Ja existe um usuario com este e-mail")
  }

  if (existingNickname) {
    throw new Error("Ja existe um usuario com este nickname")
  }

  const created = await usersService.createUser({
    name: values.name.trim(),
    email,
    nickname,
    password: values.password,
    pro: false,
  })

  if (!created) {
    throw new Error("Nao foi possivel criar sua conta")
  }

  const authUser = toAuthUser(created)
  setStoredAuthUser(authUser)
  return authUser
}
