import { createContext, useContext, useState, useEffect } from "react"

export const THEMES = [
  { id: "elegante", label: "Elegante" },
  { id: "noir", label: "Noir" },
  { id: "glass", label: "Glass" },
  { id: "clay", label: "Clay" },
  { id: "brutal", label: "Brutal" },
  { id: "minimal", label: "Minimal" },
  { id: "fintech", label: "Fintech" },
  { id: "midnight", label: "Midnight" },
  { id: "emerald", label: "Emerald" },
]

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("elegante")

  useEffect(() => {
    const root = document.documentElement
    THEMES.forEach((t) => root.classList.remove(`theme-${t.id}`))
    if (theme !== "elegante") root.classList.add(`theme-${theme}`)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider")
  return ctx
}