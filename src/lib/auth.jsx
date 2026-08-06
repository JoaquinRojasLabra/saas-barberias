import { createContext, useContext, useState } from "react"

const AuthContext = createContext()

const AUTH_KEY = "saas-barberias:session"
const CRED_KEY = "saas-barberias:credentials"

const DEFAULT_CREDS = { user: "demo", pass: "barberia" }

function readCreds() {
  try {
    const raw = localStorage.getItem(CRED_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_CREDS
  } catch {
    return DEFAULT_CREDS
  }
}

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === "1"
    } catch {
      return false
    }
  })

  const login = (user, pass) => {
    const creds = readCreds()
    if (user.trim().toLowerCase() === creds.user.toLowerCase() && pass === creds.pass) {
      try { localStorage.setItem(AUTH_KEY, "1") } catch { /* ignore */ }
      setAuthed(true)
      return true
    }
    return false
  }

  const logout = () => {
    try { localStorage.removeItem(AUTH_KEY) } catch { /* ignore */ }
    setAuthed(false)
  }

  const updateCredentials = (user, pass) => {
    try { localStorage.setItem(CRED_KEY, JSON.stringify({ user, pass })) } catch { /* ignore */ }
  }

  return (
    <AuthContext.Provider value={{ authed, login, logout, updateCredentials }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}