import { useMemo } from "react"
import { CurrencyCircleDollar, CalendarCheck, UserMinus, Users } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { formatCLP, hoyKey } from "@/lib/format"
import MetricCard from "./MetricCard"
import ProgressRing from "./ProgressRing"
import SalesChart from "./SalesChart"
import CountUp from "@/components/CountUp"

function diasSemana(hoy) {
  const f = new Date(hoy + "T12:00:00")
  const dia = (f.getDay() + 6) % 7 // lunes=0
  const lunes = new Date(f)
  lunes.setDate(f.getDate() - dia)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes)
    d.setDate(lunes.getDate() + i)
    return {
      key: d.toISOString().slice(0, 10),
      nombre: ["L", "M", "X", "J", "V", "S", "D"][i],
    }
  })
}

export default function Dashboard() {
  const { scope, qrStats, esBarbero, session, empleados } = useStore()
  const { turnos, ventas } = scope
  const hoy = hoyKey()

  const semana = useMemo(() => {
    const dias = diasSemana(hoy)
    return dias.map((d) => ({
      day: d.nombre,
      value: ventas
        .filter((v) => v.fechaHora?.startsWith(d.key) && !v.pendientePago)
        .reduce((acc, v) => acc + v.monto, 0),
    }))
  }, [ventas, hoy])

  const metaDia = useMemo(() => {
    const conVentas = semana.filter((d) => d.value > 0)
    if (conVentas.length === 0) return 0
    const prom = conVentas.reduce((acc, d) => acc + d.value, 0) / conVentas.length
    return Math.round(prom / 1000) * 1000
  }, [semana])

  const resumen = useMemo(() => {
    const ventasHoy = ventas.filter((v) => v.fechaHora?.startsWith(hoy) && !v.pendientePago)
    const totalHoy = ventasHoy.reduce((acc, v) => acc + v.monto, 0)
    const turnosHoy = turnos.filter((t) => t.fecha === hoy && t.estado !== "cancelado")
    const noLlego = turnosHoy.filter((t) => t.estado === "no-llego").length
    const fechaCorte = new Date(Date.now() - 7 * 86400000).toISOString()
    const escaneos = qrStats.filter((q) => (q.fechaHora || "") >= fechaCorte).length
    return { totalHoy, noLlego, turnosHoy: turnosHoy.length, escaneos, metaDia }
  }, [ventas, turnos, qrStats, hoy, metaDia])

  const barberoNombre = empleados.find((e) => e.id === session?.barberoId)?.nombre || "barbero"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="text-xl font-extrabold tracking-tight">
          {esBarbero ? `Hola, ${barberoNombre}` : "Panel del negocio"}
        </h1>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
          {esBarbero ? "Tu actividad" : "Todo el local"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon={CurrencyCircleDollar} label="Ventas hoy" value={<CountUp n={resumen.totalHoy} format={(v) => formatCLP(v)} />} sub={{ text: `Meta ${formatCLP(resumen.metaDia)}` }} delay={0} />
        <MetricCard icon={CalendarCheck} label="Turnos hoy" value={<CountUp n={resumen.turnosHoy} />} sub={{ text: "agendados" }} delay={0.1} />
        <MetricCard icon={UserMinus} label="No llegó" value={<CountUp n={resumen.noLlego} />} sub={{ text: resumen.noLlego > 0 ? "revisa agenda" : "todo perfecto", className: resumen.noLlego > 0 ? "text-red-500" : "text-green-600" }} delay={0.2} />
        <MetricCard icon={Users} label="Escaneos QR" value={<CountUp n={resumen.escaneos} />} sub={{ text: "esta semana" }} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 flex items-center justify-center">
          <ProgressRing value={resumen.totalHoy} max={resumen.metaDia} label={`de la meta de hoy · ${formatCLP(resumen.metaDia)}`} />
        </div>
        <div className="lg:col-span-2">
          <SalesChart data={semana} />
        </div>
      </div>
    </div>
  )
}