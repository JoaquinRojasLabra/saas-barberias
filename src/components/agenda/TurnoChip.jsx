import { CheckCircle, WarningCircle, Clock, XCircle } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const styles = {
  confirmado: "border-[var(--border)] text-[var(--fg)]",
  cumplido: "border-green-500/40 text-green-700",
  "no-show": "border-red-500/40 text-red-600",
  cancelado: "border-[var(--border)] text-[var(--fg-muted)] line-through",
}

export default function TurnoChip({ turno, cliente, servicio, onEstado }) {
  const Icon = turno.estado === "cumplido" ? CheckCircle : turno.estado === "no-show" ? WarningCircle : turno.estado === "cancelado" ? XCircle : Clock

  return (
    <div className={cn("flex items-center justify-between gap-3 border rounded-xl px-4 py-3 surface", styles[turno.estado])}>
      <div className="flex items-center gap-3 min-w-0">
        <Icon size={20} weight="fill" className="shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{cliente?.nombre || "Cliente"}</p>
          <p className="text-xs text-[var(--fg-muted)]">{turno.hora} · {servicio?.nombre || "Servicio"}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button title="Cumplido" onClick={() => onEstado(turno.id, "cumplido")} className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-600"><CheckCircle size={16} /></button>
        <button title="No-show" onClick={() => onEstado(turno.id, "no-show")} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500"><WarningCircle size={16} /></button>
      </div>
    </div>
  )
}