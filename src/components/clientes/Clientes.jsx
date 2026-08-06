import { useState } from "react"
import { Phone, Plus, MagnifyingGlass, PencilSimple } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { formatCLP } from "@/lib/format"
import ClienteModal from "./ClienteModal"
import FichaCliente from "./FichaCliente"

export default function Clientes() {
  const { clientes, ventas, turnos } = useStore()
  const [ficha, setFicha] = useState(null)
  const [modal, setModal] = useState(null) // null | "nuevo" | {cliente}
  const [q, setQ] = useState("")

  const ordenados = [...clientes]
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    .filter((c) => !q || c.nombre.toLowerCase().includes(q.toLowerCase()) || c.telefono.includes(q))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold tracking-tight">Clientes</h1>
        <button onClick={() => setModal("nuevo")} className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl">
          <Plus size={18} weight="bold" /> Nuevo cliente
        </button>
      </div>

      <div className="relative">
        <MagnifyingGlass size={18} weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="w-full surface pl-10 pr-3 py-2 text-sm outline-none"
        />
      </div>

      <div className="space-y-2">
        {ordenados.map((c) => {
          const ventasCliente = ventas.filter((v) => v.clienteId === c.id)
          const total = ventasCliente.reduce((s, v) => s + v.monto, 0)
          const turnosCliente = turnos.filter((t) => t.clienteId === c.id)
          return (
            <div key={c.id} className="w-full flex items-center gap-3 border border-[var(--border)] rounded-xl px-4 py-3 surface hover:-translate-y-0.5 transition-all">
              <button onClick={() => setFicha(c)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--accent)] text-white font-bold shrink-0">
                  {c.nombre[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{c.nombre}</p>
                  <p className="text-xs text-[var(--fg-muted)] flex items-center gap-1"><Phone size={12} /> {c.telefono}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold">{formatCLP(total)}</p>
                  <p className="text-xs text-[var(--fg-muted)]">{ventasCliente.length} ventas · {turnosCliente.length} turnos</p>
                </div>
              </button>
              <button onClick={() => setModal(c)} aria-label={`Editar ${c.nombre}`} className="text-[var(--fg-muted)] hover:text-[var(--accent)] shrink-0"><PencilSimple size={16} /></button>
            </div>
          )
        })}
        {ordenados.length === 0 && <p className="text-sm text-[var(--fg-muted)]">{q ? "Sin resultados." : "No hay clientes registrados."}</p>}
      </div>

      {modal && <ClienteModal cliente={modal === "nuevo" ? null : modal} onClose={() => setModal(null)} />}
      {ficha && <FichaCliente cliente={ficha} onClose={() => setFicha(null)} />}
    </div>
  )
}