import { ChartLineUp, CalendarCheck, Users, CurrencyCircleDollar, QrCode, GearSix } from "@phosphor-icons/react"
import { useStore } from "@/context/store"

const items = [
  { id: "dashboard", icon: ChartLineUp, label: "Inicio" },
  { id: "agenda", icon: CalendarCheck, label: "Agenda" },
  { id: "ventas", icon: CurrencyCircleDollar, label: "Ventas" },
  { id: "clientes", icon: Users, label: "Clientes" },
  { id: "qr", icon: QrCode, label: "QR" },
  { id: "ajustes", icon: GearSix, label: "Más" },
]

export default function BottomNav() {
  const { view, setView } = useStore()

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--border)] bg-[var(--bg-card)]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around px-2 py-2">
        {items.map((it) => {
          const Icon = it.icon
          const active = view === it.id
          return (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-medium text-[var(--fg-muted)]"
            >
              <Icon size={22} weight={active ? "fill" : "regular"} className={active ? "text-[var(--accent)]" : ""} />
              {it.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}