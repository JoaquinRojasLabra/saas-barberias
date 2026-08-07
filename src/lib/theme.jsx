import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useStore } from "@/context/store"

export const THEMES = [
  { id: "elegante", label: "Elegante" },
  { id: "noir", label: "Noir" },
  { id: "glass", label: "Glass" },
  { id: "clay", label: "Clay" },
  { id: "brutal", label: "Brutal" },
  { id: "minimal", label: "Minimal" },
  { id: "fintech", label: "Fintech" },
  { id: "barbero", label: "Barbero" },
  { id: "emerald", label: "Emerald" },
]

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const { negocio, updateNegocio } = useStore()
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem("saas-barberias:theme") || negocio?.tema || "elegante"
    } catch {
      return negocio?.tema || "elegante"
    }
  })
  const themeRef = useRef(theme)
  themeRef.current = theme

  const setTheme = useCallback((t) => {
    if (themeRef.current === t) return
    updateNegocio({ tema: t })
    setThemeState(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const root = document.documentElement
    THEMES.forEach((t) => root.classList.remove(`theme-${t.id}`))
    if (theme !== "elegante") root.classList.add(`theme-${theme}`)
    try {
      localStorage.setItem("saas-barberias:theme", theme)
    } catch {
      /* ignorar */
    }
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme, THEMES }), [theme, setTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider")
  return ctx
}
