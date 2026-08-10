import { ArrowCounterClockwise } from "@phosphor-icons/react"
import { useTheme } from "@/lib/theme"
import { cn } from "@/lib/utils"

export default function PestañaEstilo({ draft, set, reiniciar }) {
  const { THEMES } = useTheme()
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide mb-2">Tema base</p>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => set("tema", t.id)}
              className={cn(
                "px-2 py-2 rounded-xl text-xs font-semibold border transition-colors",
                draft.tema === t.id
                  ? "bg-[var(--accent)] text-white border-transparent shadow-[var(--shadow)]"
                  : "bg-[var(--bg-card)] text-[var(--fg-muted)] hover:bg-[var(--accent)]/10",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide mb-2">Color de marca (opcional)</p>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(draft.accentColor) ? draft.accentColor : "#d4af37"}
            onChange={(e) => set("accentColor", e.target.value)}
            className="w-12 h-12 rounded-xl border border-[var(--border)] bg-transparent cursor-pointer"
            aria-label="Color de marca"
          />
          <div className="flex-1 min-w-0">
            <input
              className="w-full surface px-3 py-2 text-sm font-mono"
              value={draft.accentColor}
              onChange={(e) => set("accentColor", e.target.value)}
              placeholder="#d4af37"
            />
            <p className="text-[11px] text-[var(--fg-muted)] mt-1">Elige el color de tus botones y acentos. Déjalo vacío para usar el del tema.</p>
          </div>
        </div>
      </div>

      <button
        onClick={reiniciar}
        className="inline-flex items-center gap-2 surface px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--fg-muted)] hover:text-[var(--fg)]"
      >
        <ArrowCounterClockwise size={16} /> Restablecer al estilo base
      </button>
    </div>
  )
}