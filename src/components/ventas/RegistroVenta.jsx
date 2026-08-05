import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { X } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { hoyKey, formatCLP } from "@/lib/format"

export default function RegistroVenta({ onClose, onSave }) {
  const { clientes, servicios, empleados, addVenta } = useStore()
  const [clienteId, setClienteId] = useState(clientes[0]?.id || "")
  const [servicioId, setServicioId] = useState(servicios[0]?.id || "")
  const [fechaHora, setFechaHora] = useState(`${hoyKey()}T10:30`)
  const [empleadoId, setEmpleadoId] = useState(empleados[0]?.id || "")

  const servicio = servicios.find((s) => s.id === servicioId)

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

  const submit = (e) => {
    e.preventDefault()
    addVenta({ clienteId, servicioId, monto: servicio?.precio || 0, fechaHora, empleadoId })
    onSave?.()
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="venta-modal-title" initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl outline-none">
        <div className="flex items-center justify-between mb-4">
          <h2 id="venta-modal-title" className="text-lg font-bold">Registrar venta</h2>
          <button onClick={onClose} aria-label="Cerrar" className="text-[var(--fg-muted)] hover:text-[var(--fg)]"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-[var(--fg-muted)]">Cliente</span>
            <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required className="w-full mt-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm">
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[var(--fg-muted)]">Servicio</span>
            <select value={servicioId} onChange={(e) => setServicioId(e.target.value)} required className="w-full mt-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm">
              {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre} — {formatCLP(s.precio)}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[var(--fg-muted)]">Fecha y hora</span>
            <input type="datetime-local" value={fechaHora} onChange={(e) => setFechaHora(e.target.value)} className="w-full mt-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[var(--fg-muted)]">Empleado</span>
            <select value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)} className="w-full mt-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm">
              {empleados.map((em) => <option key={em.id} value={em.id}>{em.nombre}</option>)}
            </select>
          </label>
          <p className="text-xs font-semibold text-[var(--fg-muted)]">Total: {formatCLP(servicio?.precio || 0)}</p>
          <button type="submit" disabled={!clienteId || !servicioId || !servicio?.precio} className="w-full mt-2 bg-[var(--accent)] text-white font-semibold py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed">Registrar venta</button>
        </form>
      </motion.div>
    </motion.div>
  )
}