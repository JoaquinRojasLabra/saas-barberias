import { useState } from "react"
import { UploadSimple, LinkSimple } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { useToast } from "@/lib/toast"
import { subirImagen } from "@/lib/upload"
import Logo3D from "@/components/public/Logo3D"
import { cn } from "@/lib/utils"

export default function PestañaLogo({ draft, set }) {
  const { session } = useStore()
  const push = useToast()
  const [subiendo, setSubiendo] = useState(false)
  const accent = /^#[0-9a-fA-F]{3,8}$/.test(draft.accentColor) ? draft.accentColor : undefined

  const opciones = [
    { id: "3d", label: "3D animado" },
    { id: "imagen", label: "Imagen" },
  ]

  const subir = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendo(true)
    try {
      const url = await subirImagen(file, session?.usuarioId || "anon")
      set("logoUrl", url)
      set("logoTipo", "imagen")
      push("Logo subido")
    } catch (err) {
      push(err?.message || "No se pudo subir la imagen", "error")
    } finally {
      setSubiendo(false)
      e.target.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide">Tipo de logo</p>
      <div className="flex gap-2">
        {opciones.map((o) => (
          <button
            key={o.id}
            onClick={() => set("logoTipo", o.id)}
            className={cn(
              "flex-1 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors",
              draft.logoTipo === o.id
                ? "bg-[var(--accent)] text-white border-transparent shadow-[var(--shadow)]"
                : "bg-[var(--bg-card)] text-[var(--fg-muted)] hover:bg-[var(--accent)]/10",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl surface p-5 flex flex-col items-center gap-3">
        {draft.logoTipo === "imagen" && draft.logoUrl ? (
          <img src={draft.logoUrl} alt="Logo" className="w-20 h-20 rounded-2xl object-cover" />
        ) : (
          <Logo3D size={90} color={accent} />
        )}
        <p className="text-sm font-semibold">{draft.logoTipo === "imagen" ? "Logo imagen" : "Logo 3D animado"}</p>
      </div>

      {draft.logoTipo === "imagen" && (
        <div className="space-y-2">
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[var(--border)] rounded-2xl px-4 py-6 text-sm text-[var(--fg-muted)] cursor-pointer hover:border-[var(--accent)] transition-colors">
            <UploadSimple size={18} weight="bold" />
            {subiendo ? "Subiendo…" : "Subir imagen del logo"}
            <input type="file" accept="image/*" className="hidden" onChange={subir} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide flex items-center gap-1"><LinkSimple size={12} /> O pega una URL</span>
            <input
              className="w-full surface px-3 py-2.5 text-sm mt-1"
              value={draft.logoUrl}
              onChange={(e) => set("logoUrl", e.target.value)}
              placeholder="https://…/logo.png"
            />
          </label>
        </div>
      )}
    </div>
  )
}