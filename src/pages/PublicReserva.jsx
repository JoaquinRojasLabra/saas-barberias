import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Clock, Scissors } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { useTheme } from "@/lib/theme"
import { useToast } from "@/lib/toast"
import { formatCLP, hoyKey } from "@/lib/format"
import { navegarA, slugDe, leerRuta, parametrosDe } from "@/lib/router"
import Background from "@/components/Background"

const pasosLabel = ["Servicio", "Horario", "Tus datos", "Confirmar"]
const MAX = pasosLabel.length - 1
const METODOS = ["En la barbería", "En línea"]

export default function PublicReserva({ slug }) {
  const { negocio, servicios, empleados, slotsHorario, tomarCita, horariosOcupados, activarPorSlug } = useStore()
  const { setTheme } = useTheme()
  const push = useToast()
  const [paso, setPaso] = useState(0)
  const [servicioId, setServicioId] = useState("")
  const [empleadoId, setEmpleadoId] = useState("")
  const [fecha, setFecha] = useState(hoyKey())
  const [hora, setHora] = useState("")
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [metodo, setMetodo] = useState(METODOS[0])
  const [ocupadas, setOcupadas] = useState([])
  const [guardando, setGuardando] = useState(false)

  const slugActual = slug || slugDe(window.location.hash)
  const servicio = servicios.find((s) => s.id === servicioId)
  const empleado = empleados.find((e) => e.id === empleadoId)

  useEffect(() => {
    if (slugActual) activarPorSlug(slugActual)
  }, [slugActual, activarPorSlug])

  useEffect(() => {
    if (empleadoId && fecha) {
      horariosOcupados(fecha, empleadoId).then(setOcupadas).catch(() => setOcupadas([]))
    }
  }, [fecha, empleadoId, horariosOcupados])

  const libres = slotsHorario.filter((h) => !ocupadas.includes(h))

  const siguiente = () => setPaso((p) => Math.min(p + 1, MAX))
  const atras = () => setPaso((p) => Math.max(p - 1, 0))
  const puedeGuardar = (p) =>
    p === 0 ? !!servicioId : p === 1 ? !!hora : p === 2 ? nombre.trim() && telefono.trim() : true

  const confirmar = async () => {
    setGuardando(true)
    try {
      const metodoPago = metodo === "En línea" ? "En línea" : null
      await tomarCita({ nombre: nombre.trim(), telefono: telefono.trim(), servicioId, fecha, hora, empleadoId, metodoPago })
      push(metodoPago === "En línea" ? "Reserva creada. Se generó un pago en línea pendiente." : "¡Cita confirmada! Te esperamos.")
      navegarA(`/c/${slugActual}`)
    } catch (e) {
      push((e?.message || "No se pudo reservar. Intenta de nuevo.").replace(/^RPC exception on /, ""), "error")
    } finally {
      setGuardando(false)
    }
  }

  useEffect(() => {
    const { query } = leerRuta()
    const { tema } = parametrosDe(query)
    setTheme(tema || negocio?.tema || "elegante")
  }, [negocio?.tema, setTheme])

  const input = "w-full surface px-3 py-2 text-sm"

  const selClase = "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-white border-transparent shadow-[var(--shadow-lg)]"
  const noSelClase = "bg-[var(--bg-card)] text-[var(--fg)] hover:bg-[var(--accent)]/10"

  return (
    <div className="min-h-screen text-[var(--fg)] px-6 py-8 max-w-xl mx-auto relative">
      <Background />
      <button onClick={() => navegarA(`/c/${slug}`)} className="inline-flex items-center gap-1 text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]">
        <ArrowLeft size={14} /> Volver a la barbería
      </button>

      <div className="flex gap-1.5 mt-4">
        {pasosLabel.map((t, i) => (
          <motion.span
            key={t}
            layout
            initial={false}
            animate={{ scale: i === paso ? 1 : 0.96 }}
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${i === paso ? "bg-[var(--accent)] text-white shadow-[var(--shadow)]" : "bg-[var(--bg-card)] text-[var(--fg-muted)]"}`}
          >
            {t}
          </motion.span>
        ))}
      </div>

      <motion.section
        key={paso}
        initial={{ opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 space-y-3"
      >
        {paso === 0 && (
          <>
            <motion.h1 initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-extrabold">Elige el servicio</motion.h1>
            <div className="space-y-2">
              {servicios.map((s, i) => {
                const sel = servicioId === s.id
                return (
                  <motion.button
                    key={s.id}
                    layout
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setServicioId(s.id)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28, delay: i * 0.05 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors ${sel ? selClase : noSelClase} border-[var(--border)]`}
                  >
                    <motion.div animate={{ scale: sel ? 1 : 0.9, rotate: sel ? 0 : -90 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${sel ? "bg-white/20" : "bg-[var(--accent)]/15 text-[var(--accent)]"}`}>
                      <Scissors weight="bold" size={18} />
                    </motion.div>
                    <span className="flex-1 min-w-0 text-left">
                      <span className={`block text-sm font-semibold ${sel ? "" : ""}`}>{s.nombre}</span>
                      <span className={`block text-xs ${sel ? "text-white/80" : "text-[var(--fg-muted)]"} flex items-center gap-1`}><Clock size={11} weight="bold" /> {s.duracion} min</span>
                    </span>
                    <span className={`text-sm font-extrabold ${sel ? "text-white" : ""}`}>{formatCLP(s.precio)}</span>
                    {sel && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 22 }} className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[var(--accent)] shrink-0"><Check size={14} weight="bold" /></motion.span>}
                  </motion.button>
                )
              })}
            </div>
          </>
        )}

        {paso === 1 && (
          <>
            <motion.h1 initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-extrabold">¿Con quién y cuándo?</motion.h1>
            <div>
              <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-2">Barbero</p>
              <div className="flex flex-wrap gap-2">
                {empleados.map((e) => {
                  const sel = empleadoId === e.id
                  return (
                    <motion.button
                      key={e.id}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => { setEmpleadoId(e.id); setHora("") }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${sel ? selClase : noSelClase} border-[var(--border)]`}
                    >
                      {sel ? `${e.nombre} ✓` : e.nombre}
                    </motion.button>
                  )
                })}
              </div>
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide">Fecha</span>
              <input type="date" min={hoyKey()} value={fecha} onChange={(e) => { setFecha(e.target.value); setHora("") }} className={`${input} mt-1`} />
            </label>
            <div>
              <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide mb-2">Horas disponibles</p>
              {libres.length === 0 ? (
                <p className="text-sm text-[var(--fg-muted)] bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3 py-4 text-center">Sin cupos para esa fecha. Elige otra.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {libres.map((h) => {
                    const sel = hora === h
                    return (
                      <motion.button
                        key={h}
                        whileTap={{ scale: 0.92 }}
                        whileHover={{ scale: 1.06 }}
                        onClick={() => setHora(h)}
                        className={`relative px-3 py-2.5 rounded-xl text-sm font-bold border transition-colors ${sel ? selClase : noSelClase} border-[var(--border)]`}
                      >
                        {sel && (
                          <motion.span layoutId={`slot-${h}`} className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-white text-[var(--accent)] shadow-[var(--shadow)]">
                            <Check size={12} weight="bold" />
                          </motion.span>
                        )}
                        {h}
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {paso === 2 && (
          <>
            <motion.h1 initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-extrabold">Tus datos</motion.h1>
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
            <motion.h1 initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-extrabold">Confirma tu cita</motion.h1>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 320, damping: 24 }} className="surface p-5 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[var(--fg-muted)]">Servicio</span><span className="font-semibold">{servicio?.nombre}</span></div>
              <div className="flex justify-between"><span className="text-[var(--fg-muted)]">Barbero</span><span className="font-semibold">{empleado?.nombre}</span></div>
              <div className="flex justify-between"><span className="text-[var(--fg-muted)]">Fecha</span><span className="font-semibold">{fecha}</span></div>
              <div className="flex justify-between"><span className="text-[var(--fg-muted)]">Hora</span><span className="font-semibold">{hora}</span></div>
              <div className="flex justify-between border-t border-[var(--border)] pt-2 mt-2"><span className="text-[var(--fg-muted)]">Total</span><span className="font-extrabold text-lg">{formatCLP(servicio?.precio || 0)}</span></div>
            </motion.div>
            <div>
              <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-2">Cómo pagarás</p>
              <div className="grid grid-cols-2 gap-2">
                {METODOS.map((m) => {
                  const sel = metodo === m
                  return (
                    <motion.button
                      key={m}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMetodo(m)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${sel ? selClase : noSelClase} border-[var(--border)]`}
                    >
                      {m === "En línea" ? "Pago en línea" : "En la barbería"}
                    </motion.button>
                  )
                })}
              </div>
              {metodo === "En línea" && (
                <p className="text-xs text-[var(--fg-muted)] flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3 py-2.5">
                  <Check size={14} className="text-[var(--accent)]" /> Reservas tu cupo y generas un pago en línea. Podrás confirmarlo después.
                </p>
              )}
            </div>
          </>
        )}

        <div className="flex gap-2 pt-2">
          {paso > 0 && (
            <motion.button whileTap={{ scale: 0.95 }} onClick={atras} className="surface px-5 py-3 rounded-2xl text-sm font-semibold">Atrás</motion.button>
          )}
          {paso < MAX ? (
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={siguiente}
              disabled={!puedeGuardar(paso)}
              className="flex-1 flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-semibold py-3 rounded-2xl disabled:opacity-40 disabled:pointer-events-none shadow-[var(--shadow-lg)]"
            >
              Continuar <ArrowRight size={16} weight="bold" />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={confirmar}
              disabled={guardando}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-white font-semibold py-3 rounded-2xl shadow-[var(--shadow-lg)] disabled:opacity-50 disabled:pointer-events-none"
            >
              {guardando ? "Guardando…" : (<><Check size={18} weight="bold" /> Confirmar cita</>)}
            </motion.button>
          )}
        </div>
      </motion.section>
    </div>
  )
}