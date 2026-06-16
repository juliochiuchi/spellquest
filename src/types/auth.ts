export type UserRecord = {
  id: string
  name: string
  email: string
  nickname: string
  password: string
  pro: boolean
}

export type AuthUser = Omit<UserRecord, "password">
