import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { X } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { useToast } from "@/lib/toast"

export default function ClienteModal({ onClose, cliente }) {
  const { addCliente, updateCliente } = useStore()
  const push = useToast()
  const editing = Boolean(cliente)

  const [form, setForm] = useState({
    nombre: cliente?.nombre || "",
    telefono: cliente?.telefono || "",
    notas: cliente?.notas || "",
  })

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
    if (!form.nombre.trim()) return
    if (editing) {
      updateCliente(cliente.id, form)
      push("Cliente actualizado")
    } else {
      addCliente(form)
      push("Cliente registrado")
    }
    onClose()
  }

  const input = "w-full mt-1 surface px-3 py-2 text-sm"

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <motion.div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="cliente-modal-title" initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12, opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 28 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md max-h-[88vh] sm:max-h-[80vh] surface rounded-2xl p-5 sm:p-6 shadow-2xl outline-none overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 id="cliente-modal-title" className="text-lg font-bold">{editing ? "Editar cliente" : "Nuevo cliente"}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="text-[var(--fg-muted)] hover:text-[var(--fg)]"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-[var(--fg-muted)]">Nombre</span>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required className={input} placeholder="Nombre y apellido" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[var(--fg-muted)]">Teléfono</span>
            <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className={input} placeholder="+56911112222" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[var(--fg-muted)]">Notas</span>
            <textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} rows={3} className={`${input} resize-none`} placeholder="Preferencias, cortes habituales..." />
          </label>
          <button type="submit" disabled={!form.nombre.trim()} className="w-full mt-2 bg-[var(--accent)] text-white font-semibold py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed">
            {editing ? "Guardar cambios" : "Registrar cliente"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}
