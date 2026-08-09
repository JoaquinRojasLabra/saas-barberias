import { createContext, useContext, useCallback } from "react"
import { useStore } from "@/context/store"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const { session, cargando, login: storeLogin, logout: storeLogout } = useStore()

  const authed = Boolean(session && session.negocioId && session.rol !== "anon")

  const login = useCallback(
    async (email, pass) => {
      if (!email || !pass) throw new Error("Ingresa email y contraseña")
      return storeLogin(email, pass)
    },
    [storeLogin],
  )

  const logout = useCallback(async () => {
    await storeLogout()
  }, [storeLogout])

  const usuarioActivo = session?.usuarioId || null
  const rol = session?.rol || null

  return (
    <AuthContext.Provider value={{ authed, cargando, login, logout, usuarioActivo, rol, session }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}