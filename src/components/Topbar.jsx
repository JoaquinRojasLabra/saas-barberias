import { useTheme } from "@/lib/theme"
import { useStore } from "@/context/store"
import { useAuth } from "@/lib/auth"
import { hoyKey } from "@/lib/format"
import { navegarA } from "@/lib/router"
import { Globe, SignOut, Palette } from "@phosphor-icons/react"

export default function Topbar() {
  const { theme, setTheme, THEMES } = useTheme()
  const { updateNegocio, negocio, setView } = useStore()
  const { logout } = useAuth()

  const cambiarTema = (tema) => {
    setTheme(tema)
    updateNegocio({ tema })
  }

  return (
    <header className="app-chrome flex items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-[var(--bg-card)] border-b border-[var(--border)] backdrop-blur-md">
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-[var(--fg-muted)] uppercase tracking-widest">Hoy</p>
        <p className="text-sm font-bold truncate">{hoyKey()}</p>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-[var(--fg-muted)]">Estilo del panel</span>
          <select
            value={theme}
            onChange={(e) => cambiarTema(e.target.value)}
            className="surface px-3 py-1.5 text-sm font-medium outline-none cursor-pointer"
          >
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setView("ajustes")}
          className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl text-[var(--fg-muted)] hover:text-[var(--accent)]"
          aria-label="Ajustes y tema"
        >
          <Palette size={18} />
        </button>
        <button
          onClick={() => navegarA(`/c/${negocio.slug}`)}
          className="lg:hidden flex items-center gap-1.5 text-[var(--fg-muted)] hover:text-[var(--accent)] px-2 py-1.5 rounded-xl text-xs font-medium"
        >
          <Globe size={18} /> Ver página
        </button>
        <button
          onClick={logout}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-[var(--fg-muted)] hover:text-red-500"
          aria-label="Cerrar sesión"
        >
          <SignOut size={18} />
        </button>
      </div>
    </header>
  )
}
