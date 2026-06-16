import type { AuthUser } from "@/types/auth"

const AUTH_SESSION_KEY = "spellquest.auth.user"

export function getStoredAuthUser() {
  if (typeof window === "undefined") return null

  const raw = window.localStorage.getItem(AUTH_SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_KEY)
    return null
  }
}

export function setStoredAuthUser(user: AuthUser) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user))
}

export function clearStoredAuthUser() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(AUTH_SESSION_KEY)
}
