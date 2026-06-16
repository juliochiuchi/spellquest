import * as React from "react"

import * as authController from "@/controllers/authController"
import type { LoginFormValues, RegisterFormValues } from "@/types/forms"
import type { AuthUser } from "@/types/auth"

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (values: LoginFormValues) => Promise<AuthUser>
  register: (values: RegisterFormValues) => Promise<AuthUser>
  logout: () => void
  refreshUser: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(() => authController.getAuthUser())

  const refreshUser = React.useCallback(() => {
    setUser(authController.getAuthUser())
  }, [])

  const login = React.useCallback(async (values: LoginFormValues) => {
    const nextUser = await authController.loginUser(values)
    setUser(nextUser)
    return nextUser
  }, [])

  const register = React.useCallback(async (values: RegisterFormValues) => {
    const nextUser = await authController.registerUser(values)
    setUser(nextUser)
    return nextUser
  }, [])

  const logout = React.useCallback(() => {
    authController.logoutUser()
    setUser(null)
  }, [])

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key?.includes("spellquest.auth.user")) {
        refreshUser()
      }
    }

    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("storage", onStorage)
    }
  }, [refreshUser])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, login, register, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider")
  return ctx
}
