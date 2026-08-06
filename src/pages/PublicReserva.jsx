import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Check } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { useToast } from "@/lib/toast"
import { formatCLP, hoyKey } from "@/lib/format"
import { navegarA, slugDe } from "@/lib/router"

const pasosLabel = ["Servicio", "Horario", "Tus datos", "Confirmar"]
const MAX = pasosLabel.length - 1

export default function PublicReserva() {
  const { servicios, empleados, clientes, turnos, slotsHorario, tomarCita, addCliente } = useStore()
  const push = useToast()
  const [paso, setPaso] = useState(0)
  const [servicioId, setServicioId] = useState("")
  const [empleadoId, setEmpleadoId] = useState(empleados[0]?.id || "")
  const [fecha, setFecha] = useState(hoyKey())
  const [hora, setHora] = useState("")
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")

  const slug = slugDe(window.location.hash)
  const servicio = servicios.find((s) => s.id === servicioId)
  const empleado = empleados.find((e) => e.id === empleadoId)

  const ocupadas = turnos
    .filter((t) => t.fecha === fecha && t.empleadoId === empleadoId && !["cancelado", "no-llego"].includes(t.estado))
    .map((t) => t.hora)
  const libres = slotsHorario.filter((h) => !ocupadas.includes(h))

  const siguiente = () => setPaso((p) => Math.min(p + 1, MAX))
  const atras = () => setPaso((p) => Math.max(p - 1, 0))
  const puedeGuardar = (p) =>
    p === 0 ? !!servicioId : p === 1 ? !!hora : p === 2 ? nombre.trim() && telefono.trim() : true

  const confirmar = () => {
    const existente = clientes.find((c) => c.nombre.toLowerCase() === nombre.trim().toLowerCase())
    const cliente = existente || addCliente({ nombre: nombre.trim(), telefono: telefono.trim(), visitas: 0 })
    tomarCita({ clienteId: cliente.id, servicioId, fecha, hora, empleadoId })
    push("¡Cita confirmada! Te esperamos.")
    navegarA(`/c/${slug}`)
  }

  const input = "w-full surface px-3 py-2 text-sm"

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] px-6 py-8 max-w-xl mx-auto">
      <button onClick={() => navegarA(`/c/${slug}`)} className="inline-flex items-center gap-1 text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]">
        <ArrowLeft size={14} /> Volver a la barbería
      </button>

      <div className="flex gap-1.5 mt-4">
        {pasosLabel.map((t, i) => (
          <span key={t} className={`text-[10px] px-2 py-1 rounded-lg font-medium ${i <= paso ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-card)] text-[var(--fg-muted)]"}`}>{t}</span>
        ))}
      </div>

      <motion.section key={paso + empleadoId + fecha} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="mt-8 space-y-3">
        {paso === 0 && (
          <>
            <h1 className="text-xl font-extrabold">Elige el servicio</h1>
            {servicios.map((s) => (
              <button key={s.id} onClick={() => setServicioId(s.id)} className={`w-full surface px-4 py-3 text-left flex items-center justify-between ${servicioId === s.id ? "ring-2 ring-[var(--accent)]" : ""}`}>
                <span>
                  <span className="block text-sm font-semibold">{s.nombre}</span>
                  <span className="block text-xs text-[var(--fg-muted)]">{s.duracion} min</span>
                </span>
                <span className="text-sm font-extrabold">{formatCLP(s.precio)}</span>
              </button>
            ))}
          </>
        )}

        {paso === 1 && (
          <>
            <h1 className="text-xl font-extrabold">¿Con quién y cuándo?</h1>
            <div>
              <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-2">Barbero</p>
              <div className="flex flex-wrap gap-2">
                {empleados.map((e) => (
                  <button key={e.id} onClick={() => { setEmpleadoId(e.id); setHora("") }} className={`surface px-4 py-2 text-sm font-medium ${empleadoId === e.id ? "ring-2 ring-[var(--accent)]" : ""}`}>{e.nombre}</button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide">Fecha</span>
              <input type="date" min={hoyKey()} value={fecha} onChange={(e) => { setFecha(e.target.value); setHora("") }} className={`${input} mt-1`} />
            </label>
            <div>
              <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide mb-2">Horas disponibles</p>
              {libres.length === 0 ? (
                <p className="text-sm text-[var(--fg-muted)]">Sin cupos para esa fecha. Elige otra.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {libres.map((h) => (
                    <button key={h} onClick={() => setHora(h)} className={`surface px-3 py-2 text-sm font-semibold ${hora === h ? "ring-2 ring-[var(--accent)]" : ""}`}>{h}</button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {paso === 2 && (
          <>
            <h1 className="text-xl font-extrabold">Tus datos</h1>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide">Nombre</span>
              <input className={`${input} mt-1`} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide">WhatsApp</span>
              <input className={`${input} mt-1`} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+569 1234 5678" inputMode="tel" />
            </label>
          </>
        )}

        {paso === 3 && (
          <>
            <h1 className="text-xl font-extrabold">Confirma tu cita</h1>
            <div className="surface p-5 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[var(--fg-muted)]">Servicio</span><span className="font-semibold">{servicio?.nombre}</span></div>
              <div className="flex justify-between"><span className="text-[var(--fg-muted)]">Barbero</span><span className="font-semibold">{empleado?.nombre}</span></div>
              <div className="flex justify-between"><span className="text-[var(--fg-muted)]">Fecha</span><span className="font-semibold">{fecha}</span></div>
              <div className="flex justify-between"><span className="text-[var(--fg-muted)]">Hora</span><span className="font-semibold">{hora}</span></div>
              <div className="flex justify-between border-t border-[var(--border)] pt-2 mt-2"><span className="text-[var(--fg-muted)]">Total</span><span className="font-extrabold">{formatCLP(servicio?.precio || 0)}</span></div>
            </div>
          </>
        )}

        <div className="flex gap-2 pt-2">
          {paso > 0 && (
            <button onClick={atras} className="surface px-4 py-3 rounded-2xl text-sm font-semibold">Atrás</button>
          )}
          {paso < MAX ? (
            <button onClick={siguiente} disabled={!puedeGuardar(paso)} className="flex-1 flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-semibold py-3 rounded-2xl disabled:opacity-40">
              Continuar <ArrowRight size={16} weight="bold" />
            </button>
          ) : (
            <button onClick={confirmar} className="flex-1 flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-semibold py-3 rounded-2xl">
              <Check size={18} weight="bold" /> Confirmar cita
            </button>
          )}
        </div>
      </motion.section>
    </div>
  )
}