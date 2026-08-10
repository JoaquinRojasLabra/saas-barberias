import { MapPin, Clock, Phone, Scissors, ArrowRight } from "@phosphor-icons/react"
import { formatCLP } from "@/lib/format"
import { useStore } from "@/context/store"
import Logo3D from "@/components/public/Logo3D"

export default function VistaPrevia({ draft }) {
  const { servicios } = useStore()
  const tema = draft.tema && draft.tema !== "elegante" ? `theme-${draft.tema}` : ""
  const accent = /^#[0-9a-fA-F]{3,8}$/.test(draft.accentColor) ? draft.accentColor : ""

  return (
    <div className={tema} style={{ "--accent": accent || undefined, "--accent-2": accent || undefined }}>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden text-[var(--fg)] shadow-[var(--shadow-lg)]">
        <div className="px-6 py-8 flex flex-col items-center text-center gap-2">
          {draft.logoTipo === "imagen" && draft.logoUrl ? (
            <img src={draft.logoUrl} alt="logo" className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <Logo3D size={72} color={accent || undefined} />
          )}
          <p className="uppercase tracking-[0.2em] text-[10px] text-[var(--fg-muted)]">Tu barbería</p>
          <h3 className="font-display text-xl font-black tracking-tight">{draft.nombre || "Mi Barbería"}</h3>
          <p className="text-xs text-[var(--fg-muted)]">{draft.direccion}</p>
          <div className="flex flex-wrap justify-center gap-2 text-[10px] text-[var(--fg-muted)]">
            {draft.ciudad && <span className="flex items-center gap-1"><MapPin size={12} /> {draft.ciudad}</span>}
            {draft.horaApertura && draft.horaCierre && <span className="flex items-center gap-1"><Clock size={12} /> {draft.horaApertura} – {draft.horaCierre}</span>}
            {draft.telefono && <span className="flex items-center gap-1"><Phone size={12} /> {draft.telefono}</span>}
          </div>
          <span className="mt-2 inline-flex items-center gap-1.5 bg-[var(--accent)] text-white text-xs font-semibold px-4 py-2 rounded-xl">
            Reservar hora <ArrowRight size={12} weight="bold" />
          </span>
        </div>

        <div className="px-5 py-4 border-t border-[var(--border)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-muted)] mb-3 flex items-center gap-1.5"><Scissors size={12} /> Servicios</p>
          <div className="grid grid-cols-2 gap-2">
            {servicios.slice(0, 4).map((s) => (
              <div key={s.id} className="rounded-xl border border-[var(--border)] p-2.5">
                <p className="text-xs font-semibold truncate">{s.nombre}</p>
                <p className="text-sm font-extrabold">{formatCLP(s.precio)}</p>
              </div>
            ))}
          </div>
        </div>

        {draft.mostrarGaleria && draft.galeria.length > 0 && (
          <div className="px-5 py-4 border-t border-[var(--border)]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-muted)] mb-3 flex items-center gap-1.5">Nuestros trabajos</p>
            <div className="grid grid-cols-3 gap-2">
              {draft.galeria.slice(0, 6).map((g, i) => (
                <img key={g.url || i} src={g.url} alt="" className="aspect-square w-full rounded-lg object-cover" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}