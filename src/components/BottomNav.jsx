import { ChartLineUp, CalendarCheck, Users, CurrencyCircleDollar, QrCode, GearSix } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { cn } from "@/lib/utils"

export default function BottomNav() {
  const { view, setView, esBarbero } = useStore()

  const items = [
    { id: "dashboard", icon: ChartLineUp, label: "Inicio", barbero: false },
    { id: "agenda", icon: CalendarCheck, label: "Agenda", barbero: true },
    { id: "ventas", icon: CurrencyCircleDollar, label: "Ventas", barbero: true },
    { id: "clientes", icon: Users, label: "Clientes", barbero: true },
    { id: "qr", icon: QrCode, label: "QR", barbero: false },
    { id: "ajustes", icon: GearSix, label: "Más", barbero: true },
  ].filter((it) => (esBarbero ? it.barbero : true))

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--border)] bg-[var(--bg-card)]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around px-2 py-1.5">
        {items.map((it) => {
          const Icon = it.icon
          const active = view === it.id
          return (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[10px] font-medium transition-colors",
                active ? "text-[var(--accent)]" : "text-[var(--fg-muted)]",
              )}
            >
              {active && (
                <span className="absolute inset-0 rounded-xl bg-[var(--accent)]/10" />
              )}
              <Icon size={22} weight={active ? "fill" : "regular"} className="relative z-10" />
              <span className="relative z-10">{it.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}