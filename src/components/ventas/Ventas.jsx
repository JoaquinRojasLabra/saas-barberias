import { useState, useRef, useEffect } from "react"
import { CurrencyDollar, Plus, CheckCircle } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { hoyKey, formatCLP, formatHora } from "@/lib/format"
import useEstadoVista from "@/components/common/useEstadoVista.jsx"
import RegistroVenta from "./RegistroVenta"

export default function Ventas() {
  const { ventas: ventasRaw, clientes, servicios, scope, esBarbero, session, marcarPagadaVenta, cargando, error, cargarTenant, negocioId } = useStore()
  const ventas = esBarbero ? scope.ventas : ventasRaw
  const [showModal, setShowModal] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const timerRef = useRef(null)

  const getCliente = (id) => clientes.find((c) => c.id === id)
  const getServicio = (id) => servicios.find((s) => s.id === id)

  const ordenadas = [...ventas].sort((a, b) => (a.fechaHora < b.fechaHora ? 1 : a.fechaHora > b.fechaHora ? -1 : 0))

  const flash = () => {
    setSavedFlash(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setSavedFlash(false), 2000)
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const totalHoy = ventas
    .filter((v) => v.fechaHora?.startsWith(hoyKey()) && !v.pendientePago)
    .reduce((sum, v) => sum + v.monto, 0)

  const estado = useEstadoVista({
    cargando,
    error,
    onReintentar: () => cargarTenant(negocioId),
    vacio: ordenadas.length === 0,
    icono: CurrencyDollar,
    titulo: "Sin ventas todavía",
    descripcion: "Registra la primera venta y llévala a tu historial",
    cta: "Registrar venta",
    onCta: () => setShowModal(true),
  })
  if (estado) return estado

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-tight">Ventas</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl">
          <Plus size={18} weight="bold" /> Registrar venta
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 surface px-4 py-3">
          <p className="text-xs text-[var(--fg-muted)]">Total hoy</p>
          <p className="text-2xl font-extrabold tracking-tight">{formatCLP(totalHoy)}</p>
        </div>
        {savedFlash && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/40 text-green-700 text-sm font-semibold px-4 py-3 rounded-2xl">
            <CheckCircle size={18} weight="bold" /> Venta registrada
          </div>
        )}
      </div>

      <div className="space-y-2">
        {ordenadas.map((v) => (
          <div key={v.id} className="flex items-center justify-between gap-3 border border-[var(--border)] rounded-xl px-4 py-3 surface">
            <div>
              <p className="text-sm font-semibold">{getCliente(v.clienteId)?.nombre || "Cliente"}</p>
              <p className="text-xs text-[var(--fg-muted)]">{getServicio(v.servicioId)?.nombre || "Servicio"} · {formatHora(v.fechaHora)}</p>
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                {v.metodo || "Efectivo"}
              </span>
              {v.pendientePago && (
                <span className="mt-1 ml-1 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-600">
                  Pendiente de pago
                </span>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-sm font-extrabold">{formatCLP(v.monto)}</p>
              {v.pendientePago && (
                <button onClick={() => marcarPagadaVenta(v.id)} className="text-[11px] font-semibold text-[var(--accent)] hover:underline">
                  Confirmar pago
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && <RegistroVenta onClose={() => setShowModal(false)} onSave={flash} empleadoPorDefecto={esBarbero ? session?.barberoId : undefined} />}
    </div>
  )
}