import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Phone, Plus, MagnifyingGlass, PencilSimple, X, UsersThree } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { formatCLP } from "@/lib/format"
import EstadoVacio from "@/components/common/EstadoVacio"
import useEstadoVista from "@/components/common/useEstadoVista.jsx"
import ClienteModal from "./ClienteModal"
import FichaCliente from "./FichaCliente"

export default function Clientes() {
  const { clientes: clientesRaw, ventas: ventasRaw, turnos: turnosRaw, scope, esBarbero, cargando, error, cargarTenant, negocioId } = useStore()
  const clientes = esBarbero ? scope.clientes : clientesRaw
  const ventas = esBarbero ? scope.ventas : ventasRaw
  const turnos = esBarbero ? scope.turnos : turnosRaw
  const [ficha, setFicha] = useState(null)
  const [modal, setModal] = useState(null) // null | "nuevo" | {cliente}
  const [q, setQ] = useState("")

  const ordenados = [...clientes]
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    .filter((c) => !q || c.nombre.toLowerCase().includes(q.toLowerCase()) || (c.telefono || "").includes(q))

  const estado = useEstadoVista({
    cargando,
    error,
    onReintentar: () => cargarTenant(negocioId),
    vacio: clientes.length === 0,
    icono: UsersThree,
    titulo: "Aún no tienes clientes",
    descripcion: "Crea tu primer cliente para llevar su ficha, turnos y ventas",
    cta: "Nuevo cliente",
    onCta: () => setModal("nuevo"),
  })
  if (estado) return estado

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Clientes</h1>
          <p className="text-xs text-[var(--fg-muted)]">{clientes.length} registrados</p>
        </div>
        <button onClick={() => setModal("nuevo")} className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-[var(--shadow)]">
          <Plus size={18} weight="bold" /> Nuevo cliente
        </button>
      </div>

      <div className="relative group">
        <MagnifyingGlass size={18} weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="w-full surface pl-10 pr-9 py-2 text-sm outline-none"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false} mode="popLayout">
          {ordenados.map((c, i) => {
            const ventasCliente = ventas.filter((v) => v.clienteId === c.id)
            const total = ventasCliente.reduce((s, v) => s + v.monto, 0)
            const turnosCliente = turnos.filter((t) => t.clienteId === c.id)
            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ type: "spring", stiffness: 380, damping: 30, delay: Math.min(i * 0.04, 0.4) }}
                whileHover={{ y: -2 }}
                className="group w-full flex items-center gap-3 border border-[var(--border)] rounded-xl px-3 py-3 surface"
              >
                <button onClick={() => setFicha(c)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-white font-bold shrink-0 shadow-[var(--shadow)]"
                  >
                    {c.nombre[0]}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{c.nombre}</p>
                    <p className="text-xs text-[var(--fg-muted)] flex items-center gap-1"><Phone size={12} /> {c.telefono || "Sin teléfono"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold">{formatCLP(total)}</p>
                    <p className="text-xs text-[var(--fg-muted)]">{ventasCliente.length} ventas · {c.visitas || turnosCliente.length} visitas</p>
                  </div>
                </button>
                <button onClick={() => setModal(c)} aria-label={`Editar ${c.nombre}`} className="text-[var(--fg-muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--accent)] transition-opacity shrink-0"><PencilSimple size={16} /></button>
              </motion.div>
            )
          })}
        </AnimatePresence>
        {ordenados.length === 0 && (
          <EstadoVacio
            icono={MagnifyingGlass}
            titulo="Sin resultados"
            descripcion={`No encontramos clientes para «${q}»`}
          />
        )}
      </div>

      <AnimatePresence>{modal && <ClienteModal cliente={modal === "nuevo" ? null : modal} onClose={() => setModal(null)} />}</AnimatePresence>
      <AnimatePresence>{ficha && <FichaCliente cliente={ficha} onClose={() => setFicha(null)} />}</AnimatePresence>
    </div>
  )
}