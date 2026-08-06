import { useMemo } from "react"
import { CurrencyCircleDollar, CalendarCheck, UserMinus, Users } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { formatCLP, hoyKey } from "@/lib/format"
import MetricCard from "./MetricCard"
import ProgressRing from "./ProgressRing"
import SalesChart from "./SalesChart"
import CountUp from "@/components/CountUp"

export default function Dashboard() {
  const { ventas, turnos, qrStats } = useStore()
  const hoy = hoyKey()

  const resumen = useMemo(() => {
    const ventasHoy = ventas.filter((v) => v.fechaHora.startsWith(hoy))
    const totalHoy = ventasHoy.reduce((acc, v) => acc + v.monto, 0)
    const turnosHoy = turnos.filter((t) => t.fecha === hoy)
    const noLlego = turnosHoy.filter((t) => t.estado === "no-llego").length
    const metaDia = 60000
    return { totalHoy, noLlego, turnosHoy: turnosHoy.length, escaneos: qrStats.length, metaDia }
  }, [ventas, turnos, qrStats, hoy])

  const semana = [
    { day: "L", value: 42000 },
    { day: "M", value: 51000 },
    { day: "X", value: 48000 },
    { day: "J", value: 65000 },
    { day: "V", value: 78000 },
    { day: "S", value: 92000 },
  ]

  return (
    <div className="space-y-6">
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
