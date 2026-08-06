import { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { X, User } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { formatCLP } from "@/lib/format"

export default function FichaCliente({ cliente, onClose }) {
  const { ventas, turnos } = useStore()
  const ventasCliente = ventas.filter((v) => v.clienteId === cliente.id)
  const total = ventasCliente.reduce((s, v) => s + v.monto, 0)
  const turnosCliente = turnos.filter((t) => t.clienteId === cliente.id)

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="ficha-cliente-title" initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md max-h-[80vh] surface rounded-2xl shadow-2xl outline-none flex flex-col">
        <div className="flex items-start justify-between gap-3 p-6 pb-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--accent)] text-white font-bold text-lg shrink-0">
              {cliente.nombre[0]}
            </div>
            <div className="min-w-0">
              <h2 id="ficha-cliente-title" className="text-lg font-bold truncate">{cliente.nombre}</h2>
              <p className="text-xs text-[var(--fg-muted)] flex items-center gap-1"><User size={12} /> {cliente.telefono}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-[var(--fg-muted)] hover:text-[var(--fg)] shrink-0"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="border border-[var(--border)] rounded-xl px-2 py-3 bg-[var(--bg)]">
              <p className="text-lg font-extrabold">{ventasCliente.length}</p>
              <p className="text-xs text-[var(--fg-muted)]">Ventas</p>
            </div>
            <div className="border border-[var(--border)] rounded-xl px-2 py-3 bg-[var(--bg)]">
              <p className="text-lg font-extrabold">{formatCLP(total)}</p>
              <p className="text-xs text-[var(--fg-muted)]">Total</p>
            </div>
            <div className="border border-[var(--border)] rounded-xl px-2 py-3 bg-[var(--bg)]">
              <p className="text-lg font-extrabold">{turnosCliente.length}</p>
              <p className="text-xs text-[var(--fg-muted)]">Turnos</p>
            </div>
          </div>
          {cliente.notas && (
            <div>
              <h3 className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide mb-1">Notas</h3>
              <p className="text-sm">{cliente.notas}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
