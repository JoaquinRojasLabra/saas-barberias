import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useStore } from "@/context/store"

export const THEMES = [
  { id: "elegante", label: "Elegante" },
  { id: "noir", label: "Noir" },
  { id: "clay", label: "Clay" },
  { id: "brutal", label: "Brutal" },
  { id: "minimal", label: "Minimal" },
  { id: "fintech", label: "Fintech" },
  { id: "barbero", label: "Barbero" },
  { id: "emerald", label: "Emerald" },
  { id: "apple", label: "Apple" },
]

const ThemeContext = createContext()

const esTemaValido = (t) =>
  t && typeof t === "string" && THEMES.some((x) => x.id === t)

export function ThemeProvider({ children }) {
  const { negocio, updateNegocio } = useStore()
  const [theme, setThemeState] = useState(() => {
    let inicial = negocio?.tema
    if (!esTemaValido(inicial)) {
      try {
        inicial = localStorage.getItem("saas-barberias:theme")
      } catch {
        inicial = null
      }
    }
    return esTemaValido(inicial) ? inicial : "elegante"
  })
  const themeRef = useRef(theme)
  themeRef.current = theme

  const setTheme = useCallback((t) => {
    if (!esTemaValido(t)) return
    if (themeRef.current === t) return
    updateNegocio({ tema: t })
    setThemeState(t)
  }, [updateNegocio])

  // La barbería manda: si el negocio tiene un tema válido, se aplica siempre
  // (incluso si el navegador conserva otro de sesiones previas) y se persiste.
  // El selector del panel/Ajustes lo cambia guardándolo vía updateNegocio.
  useEffect(() => {
    if (esTemaValido(negocio?.tema) && negocio.tema !== themeRef.current) {
      setThemeState(negocio.tema)
    }
  }, [negocio?.tema])

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

  // Color de marca: override global de --accent/--accent-2 desde el negocio.
  // Color vacío o inválido => vuelve al token del tema base.
  useEffect(() => {
    const root = document.documentElement
    const ac = negocio?.accentColor
    if (ac && /^#[0-9a-fA-F]{3,8}$/.test(ac)) {
      root.style.setProperty("--accent", ac)
      root.style.setProperty("--accent-2", ac)
    } else {
      root.style.removeProperty("--accent")
      root.style.removeProperty("--accent-2")
    }
  }, [negocio?.accentColor])

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
