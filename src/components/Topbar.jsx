import { useTheme } from "@/lib/theme"
import { hoyKey } from "@/lib/format"

export default function Topbar() {
  const { theme, setTheme, THEMES } = useTheme()

  return (
    <header className="app-chrome flex items-center justify-between px-6 py-4 bg-[var(--bg-card)] border-b border-[var(--border)] backdrop-blur-md">
      <div>
        <p className="text-xs text-[var(--fg-muted)] uppercase tracking-widest">Hoy</p>
        <p className="text-sm font-bold">{hoyKey()}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--fg-muted)]">Estilo del panel</span>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="surface px-3 py-1.5 text-sm font-medium outline-none cursor-pointer"
        >
          {THEMES.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>
    </header>
  )
}
