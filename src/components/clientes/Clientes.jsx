import { useState } from "react"
import { Phone } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { formatCLP } from "@/lib/format"
import FichaCliente from "./FichaCliente"

export default function Clientes() {
  const { clientes, ventas, turnos } = useStore()
  const [ficha, setFicha] = useState(null)

  const ordenados = [...clientes].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold tracking-tight">Clientes</h1>
      <div className="space-y-2">
        {ordenados.map((c) => {
          const ventasCliente = ventas.filter((v) => v.clienteId === c.id)
          const total = ventasCliente.reduce((s, v) => s + v.monto, 0)
          const turnosCliente = turnos.filter((t) => t.clienteId === c.id)
          return (
            <button key={c.id} onClick={() => setFicha(c)} className="w-full text-left flex items-center gap-3 border border-[var(--border)] rounded-xl px-4 py-3 bg-[var(--bg-card)] hover:border-[var(--accent)] transition-colors">
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
          )
        })}
        {ordenados.length === 0 && <p className="text-sm text-[var(--fg-muted)]">No hay clientes registrados.</p>}
      </div>
      {ficha && <FichaCliente cliente={ficha} onClose={() => setFicha(null)} />}
    </div>
  )
}
