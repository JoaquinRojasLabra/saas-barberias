import { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { X, User, ChatText, Scissors } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { formatCLP, hoyKey } from "@/lib/format"
import { crearLinkWhatsApp } from "@/lib/whatsapp"
import CountUp from "@/components/CountUp"

export default function FichaCliente({ cliente, onClose }) {
  const { ventas, turnos, servicios, negocio } = useStore()
  const ventasCliente = ventas.filter((v) => v.clienteId === cliente.id)
  const total = ventasCliente.reduce((s, v) => s + v.monto, 0)
  const turnosCliente = turnos.filter((t) => t.clienteId === cliente.id).sort((a, b) => (a.fecha > b.fecha ? -1 : 1))
  const proximos = turnosCliente.filter((t) => t.fecha >= hoyKey() && !["cumplido", "no-llego", "cancelado"].includes(t.estado))

  const ref = useRef(null)
  const prevFocus = useRef(null)

  useEffect(() => {
    prevFocus.current = document.activeElement
    ref.current?.focus()
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      prevFocus.current?.focus?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const wa = crearLinkWhatsApp(cliente.telefono, `Hola ${cliente.nombre.split(" ")[0]}, te escribo desde ${negocio.nombre}.`)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ficha-cliente-title"
        initial={{ scale: 0.95, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[80vh] surface rounded-2xl shadow-2xl outline-none flex flex-col"
      >
        <div className="flex items-start justify-between gap-3 p-6 pb-0">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.08 }}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-white font-bold text-lg shrink-0"
            >
              {cliente.nombre[0]}
            </motion.div>
            <div className="min-w-0">
              <h2 id="ficha-cliente-title" className="text-lg font-bold truncate">{cliente.nombre}</h2>
              <p className="text-xs text-[var(--fg-muted)] flex items-center gap-1"><User size={12} /> {cliente.telefono}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-[var(--fg-muted)] hover:text-[var(--fg)] shrink-0"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
          {proximos.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <Scissors size={14} weight="bold" /> Próxima cita: {proximos[0].fecha} a las {proximos[0].hora}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 text-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="border border-[var(--border)] rounded-xl px-2 py-3 bg-[var(--bg)]">
              <p className="text-lg font-extrabold"><CountUp n={ventasCliente.length} /></p>
              <p className="text-xs text-[var(--fg-muted)]">Ventas</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="border border-[var(--border)] rounded-xl px-2 py-3 bg-[var(--bg)]">
              <p className="text-lg font-extrabold">{formatCLP(total)}</p>
              <p className="text-xs text-[var(--fg-muted)]">Total</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="border border-[var(--border)] rounded-xl px-2 py-3 bg-[var(--bg)]">
              <p className="text-lg font-extrabold"><CountUp n={cliente.visitas || turnosCliente.length} /></p>
              <p className="text-xs text-[var(--fg-muted)]">Visitas</p>
            </motion.div>
          </div>

          {cliente.notas && (
            <div>
              <h3 className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide mb-1">Notas</h3>
              <p className="text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2">{cliente.notas}</p>
            </div>
          )}

          {turnosCliente.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide mb-2 flex items-center gap-1"><Scissors size={13} /> Historial</h3>
              <div className="space-y-1.5">
                {turnosCliente.slice(0, 6).map((t) => {
                  const sv = servicios.find((s) => s.id === t.servicioId)
                  return (
                    <div key={t.id} className="flex items-center justify-between text-sm border border-[var(--border)] rounded-xl px-3 py-2">
                      <span className="truncate">{sv?.nombre || "Servicio"}</span>
                      <span className="text-xs text-[var(--fg-muted)] shrink-0">{t.fecha.slice(5)} · {t.hora}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {cliente.telefono && (
            <motion.a
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold py-2.5 rounded-xl shadow-[var(--shadow)]"
            >
              <ChatText size={16} weight="bold" /> Enviar WhatsApp
            </motion.a>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}