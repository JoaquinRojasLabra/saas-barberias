import { createContext, useContext, useState, useEffect } from "react"

export const THEMES = [
  { id: "elegante", label: "Elegante" },
  { id: "fintech", label: "Fintech" },
]

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("elegante")

  useEffect(() => {
    document.documentElement.classList.toggle("theme-fintech", theme === "fintech")
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
