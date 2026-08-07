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

const esTemaValido = (t) =>
  t && typeof t === "string" && THEMES.some((x) => x.id === t)

export function ThemeProvider({ children }) {
  const { negocio, updateNegocio } = useStore()
  const [theme, setThemeState] = useState(() => {
    let inicial
    try {
      inicial = localStorage.getItem("saas-barberias:theme")
    } catch {
      inicial = null
    }
    if (!esTemaValido(inicial)) inicial = negocio?.tema
    return esTemaValido(inicial) ? inicial : "elegante"
  })
  const themeRef = useRef(theme)
  themeRef.current = theme

  const setTheme = useCallback((t) => {
    if (!esTemaValido(t)) return
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
