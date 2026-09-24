import { useState } from "react"
import { CalendarBlank, Plus } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { hoyKey } from "@/lib/format"
import useEstadoVista from "@/components/common/useEstadoVista.jsx"
import TurnoChip from "./TurnoChip"
import TurnoModal from "./TurnoModal"

export default function Agenda() {
  const { turnos: turnosRaw, clientes, servicios, setTurnoEstado, scope, esBarbero, session, cargando, error, cargarTenant, negocioId } = useStore()
  const turnos = esBarbero ? scope.turnos : turnosRaw
  const hoy = hoyKey()
  const [showModal, setShowModal] = useState(false)

  const getCliente = (id) => clientes.find((c) => c.id === id)
  const getServicio = (id) => servicios.find((s) => s.id === id)

  const ordenados = [...turnos].filter((t) => t.fecha === hoy).sort((a, b) => (a.hora < b.hora ? -1 : a.hora > b.hora ? 1 : 0))

  const estado = useEstadoVista({
    cargando,
    error,
    onReintentar: () => cargarTenant(negocioId),
    vacio: ordenados.length === 0,
    icono: CalendarBlank,
    titulo: "Sin turnos para hoy",
    descripcion: "Empieza el día agendando tu primer turno",
    cta: "Nuevo turno",
    onCta: () => setShowModal(true),
  })

  return (
    <div className="space-y-4">
      {estado ? (
        estado
      ) : (
        <>
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
          </div>
        </>
      )}
      {showModal && <TurnoModal onClose={() => setShowModal(false)} empleadoPorDefecto={esBarbero ? session.barberoId : undefined} />}
    </div>
  )
}