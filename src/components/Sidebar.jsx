import { motion } from "framer-motion"
import { ChartLineUp, CalendarCheck, Users, CurrencyCircleDollar, QrCode } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { cn } from "@/lib/utils"

const items = [
  { id: "dashboard", label: "Dashboard", icon: ChartLineUp },
  { id: "agenda", label: "Agenda", icon: CalendarCheck },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "ventas", label: "Ventas", icon: CurrencyCircleDollar },
  { id: "qr", label: "Mi QR", icon: QrCode },
]

export default function Sidebar() {
  const { view, setView, negocio, empleados } = useStore()

  return (
    <aside className="app-chrome w-60 shrink-0 h-screen sticky top-0 flex flex-col gap-6 px-4 py-6 bg-[var(--bg-card)] border-r border-[var(--border)]">
      <div className="px-2">
        <p className="text-sm font-extrabold tracking-tight">{negocio.nombre}</p>
        <p className="text-xs text-[var(--fg-muted)]">{negocio.direccion}</p>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const Icon = it.icon
          const active = view === it.id
          return (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors", active ? "bg-[var(--accent)] text-white" : "text-[var(--fg-muted)] hover:bg-black/5")}
            >
              <Icon size={20} weight={active ? "fill" : "regular"} />
              {it.label}
            </button>
          )
        })}
      </nav>
      <motion.div className="mt-auto px-3 py-3 rounded-xl bg-black/5 text-xs text-[var(--fg-muted)]">
        <p className="font-semibold text-[var(--fg)]">{empleados[0]?.nombre || "Dueño"}</p>
        <p>Dueño · {negocio.nombre}</p>
      </motion.div>
    </aside>
  )
}
