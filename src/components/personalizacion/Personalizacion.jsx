import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Storefront, Palette, ImageSquare, Images } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { useTheme } from "@/lib/theme"
import { useToast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import VistaPrevia from "./VistaPrevia"
import PestañaIdentidad from "./PestaniaIdentidad"
import PestañaEstilo from "./PestaniaEstilo"
import PestañaLogo from "./PestaniaLogo"
import PestañaGaleria from "./PestaniaGaleria"

const pestañas = [
  { id: "identidad", label: "Identidad", icon: Storefront },
  { id: "estilo", label: "Estilo", icon: Palette },
  { id: "logo", label: "Logo", icon: ImageSquare },
  { id: "galeria", label: "Galería", icon: Images },
]

export default function Personalizacion() {
  const { negocio, esBarbero, updateNegocio, guardarGaleria } = useStore()
  const { setTheme } = useTheme()
  const push = useToast()
  const [pestaña, setPestaña] = useState("identidad")
  const [draft, setDraft] = useState(() => ({
    nombre: negocio?.nombre || "",
    direccion: negocio?.direccion || "",
    telefono: negocio?.telefono || "",
    ciudad: negocio?.ciudad || "",
    horaApertura: negocio?.horaApertura || "",
    horaCierre: negocio?.horaCierre || "",
    tema: negocio?.tema || "elegante",
    accentColor: negocio?.accentColor || "",
    logoTipo: negocio?.logoTipo || "3d",
    logoUrl: negocio?.logoUrl || "",
    mostrarGaleria: negocio?.mostrarGaleria ?? false,
    galeria: [],
  }))
  const [guardando, setGuardando] = useState(false)

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  const vistaDraft = useMemo(() => ({ ...draft, galeria: draft.galeria }), [draft])

  const guardar = async () => {
    setGuardando(true)
    try {
      await updateNegocio({
        nombre: draft.nombre, direccion: draft.direccion, telefono: draft.telefono,
        ciudad: draft.ciudad, horaApertura: draft.horaApertura, horaCierre: draft.horaCierre,
        tema: draft.tema, accentColor: draft.accentColor,
        logoTipo: draft.logoTipo, logoUrl: draft.logoUrl,
        mostrarGaleria: draft.mostrarGaleria,
      })
      await guardarGaleria(draft.galeria.map((g) => g.url))
      setTheme(draft.tema)
      push("Cambios guardados")
    } catch (e) {
      push(e?.message || "No se pudo guardar", "error")
    } finally {
      setGuardando(false)
    }
  }

  const reiniciarEstilo = () => {
    set("accentColor", "")
    push("Estilo restablecido al tema base")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black tracking-tight">Personalización</h1>
        <p className="text-sm text-[var(--fg-muted)]">La identidad de tu barbería: lo que ve el cliente en tu página y al reservar.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {pestañas.map((p) => {
          const Icon = p.icon
          const activa = pestaña === p.id
          return (
            <button
              key={p.id}
              onClick={() => setPestaña(p.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shrink-0",
                activa ? "bg-[var(--accent)] text-white shadow-[var(--shadow)]" : "surface text-[var(--fg-muted)] hover:text-[var(--fg)]",
              )}
            >
              <Icon size={18} weight={activa ? "fill" : "regular"} /> {p.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          {pestaña === "identidad" && <PestañaIdentidad draft={draft} set={set} />}
          {pestaña === "estilo" && <PestañaEstilo draft={draft} set={set} reiniciar={reiniciarEstilo} />}
          {pestaña === "logo" && <PestañaLogo draft={draft} set={set} />}
          {pestaña === "galeria" && <PestañaGaleria draft={draft} set={set} />}

          {!esBarbero && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={guardar}
              disabled={guardando}
              className="w-full inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-semibold py-3 rounded-2xl shadow-[var(--shadow-lg)] disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Guardar cambios"}
            </motion.button>
          )}
        </div>

        <div className="sticky top-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--fg-muted)] mb-2">Vista previa · así la ve el cliente</p>
          <VistaPrevia draft={vistaDraft} />
        </div>
      </div>
    </div>
  )
}