import { useRef, useState } from "react"
import { UploadSimple, LinkSimple, Trash, ArrowLeft, ArrowRight } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { useToast } from "@/lib/toast"
import { subirImagen } from "@/lib/upload"

export default function PestañaGaleria({ draft, set }) {
  const { session, galeria } = useStore()
  const push = useToast()
  const [subiendo, setSubiendo] = useState(false)
  const fileRef = useRef(null)

  const list = draft.galeria.length ? draft.galeria : galeria.map((g, i) => ({ url: g.url, orden: i }))

  const subir = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendo(true)
    try {
      const url = await subirImagen(file, session?.usuarioId || "anon")
      const esDuplicada = list.some((f) => f.url === url)
      if (!esDuplicada) set("galeria", [...list, { url }])
      push("Foto agregada")
    } catch (err) {
      push(err?.message || "No se pudo subir la imagen", "error")
    } finally {
      setSubiendo(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const mover = (i, delta) => {
    const next = [...list]
    const j = i + delta
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    set("galeria", next)
  }

  return (
    <div className="space-y-4">
      <label className="flex items-center justify-between surface p-4 rounded-2xl cursor-pointer">
        <span>
          <p className="text-sm font-semibold">Mostrar galería en mi página</p>
          <p className="text-xs text-[var(--fg-muted)]">Si lo apagas, tus clientes no verán la sección de trabajos.</p>
        </span>
        <span className={toggleClase(draft.mostrarGaleria)} onClick={(e) => { e.preventDefault(); set("mostrarGaleria", !draft.mostrarGaleria) }}>
          <span className={knob(draft.mostrarGaleria)} />
        </span>
      </label>

      <div className="space-y-2">
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[var(--border)] rounded-2xl px-4 py-6 text-sm text-[var(--fg-muted)] cursor-pointer hover:border-[var(--accent)] transition-colors">
          <UploadSimple size={18} weight="bold" />
          {subiendo ? "Subiendo…" : "Subir foto"}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={subir} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide flex items-center gap-1"><LinkSimple size={12} /> O pega una URL</span>
          <input
            className="w-full surface px-3 py-2.5 text-sm mt-1"
            placeholder="https://…/foto.jpg"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                set("galeria", [...list, { url: e.target.value.trim() }])
                e.target.value = ""
                push("Foto agregada")
              }
            }}
          />
        </label>
      </div>

      {list.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {list.map((f, i) => (
            <div key={f.url || i} className="relative group aspect-square rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border)]">
              <img src={f.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button onClick={() => mover(i, -1)} className="p-1 rounded-lg bg-white/20 text-white" aria-label="Mover antes"><ArrowLeft size={14} /></button>
                <button onClick={() => mover(i, 1)} className="p-1 rounded-lg bg-white/20 text-white" aria-label="Mover después"><ArrowRight size={14} /></button>
                <button onClick={() => set("galeria", list.filter((_, j) => j !== i))} className="p-1 rounded-lg bg-red-500/80 text-white" aria-label="Quitar"><Trash size={14} /></button>
              </div>
              <span className="absolute top-1 left-1 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded">{i + 1}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function toggleClase(activo) {
  return `relative w-11 h-6 rounded-full transition-colors ${activo ? "bg-[var(--accent)]" : "bg-[var(--ring-track)]"}`
}
function knob(activo) {
  return `absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${activo ? "translate-x-5" : ""}`
}