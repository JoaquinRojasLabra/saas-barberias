import { useState } from "react"
import { Plus } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import TurnoChip from "./TurnoChip"
import TurnoModal from "./TurnoModal"

export default function Agenda() {
  const { turnos, clientes, servicios, setTurnoEstado } = useStore()
  const [showModal, setShowModal] = useState(false)

  const getCliente = (id) => clientes.find((c) => c.id === id)
  const getServicio = (id) => servicios.find((s) => s.id === id)

  const ordenados = [...turnos].sort((a, b) => (a.hora < b.hora ? -1 : a.hora > b.hora ? 1 : 0))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-tight">Agenda de hoy</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl">
          <Plus size={18} weight="bold" /> Nuevo turno
        </button>
      </div>
      <div className="space-y-2">
        {ordenados.map((t) => (
          <TurnoChip key={t.id} turno={t} cliente={getCliente(t.clienteId)} servicio={getServicio(t.servicioId)} onEstado={setTurnoEstado} />
        ))}
        {ordenados.length === 0 && <p className="text-sm text-[var(--fg-muted)]">No hay turnos agendados.</p>}
      </div>
      {showModal && <TurnoModal onClose={() => setShowModal(false)} />}
    </div>
  )
}