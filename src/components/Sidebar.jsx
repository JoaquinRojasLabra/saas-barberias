import { motion } from "framer-motion"
import { ChartLineUp, CalendarCheck, Users, CurrencyCircleDollar, QrCode, GearSix, SignOut, Globe } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { navegarA } from "@/lib/router"

export default function Sidebar() {
  const { view, setView, negocio, esBarbero, session } = useStore()
  const { logout } = useAuth()

  const items = [
    { id: "dashboard", label: "Dashboard", icon: ChartLineUp, barbero: false },
    { id: "agenda", label: "Agenda", icon: CalendarCheck, barbero: true },
    { id: "clientes", label: "Clientes", icon: Users, barbero: true },
    { id: "ventas", label: "Ventas", icon: CurrencyCircleDollar, barbero: true },
    { id: "qr", label: "Mi QR", icon: QrCode, barbero: true },
    { id: "ajustes", label: "Ajustes", icon: GearSix, barbero: true },
  ].filter((it) => (esBarbero ? it.barbero : true))

  return (
    <aside className="app-chrome hidden lg:flex w-60 shrink-0 h-screen sticky top-0 flex-col gap-6 px-4 py-6 bg-[var(--bg-card)] border-r border-[var(--border)]">
      <div className="px-2 flex items-center gap-2">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="brand-orb shrink-0"
        />
        <div>
          <p className="text-sm font-extrabold tracking-tight">{negocio?.nombre}</p>
          <p className="text-xs text-[var(--fg-muted)]">{negocio?.direccion}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5">
        {items.map((it) => {
          const Icon = it.icon
          const active = view === it.id
          return (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active ? "text-white" : "text-[var(--fg-muted)] hover:text-[var(--fg)]",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-highlight"
                  className="absolute inset-0 rounded-xl bg-[var(--accent)] shadow-[var(--shadow)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon size={20} weight={active ? "fill" : "regular"} className="relative z-10" />
              <span className="relative z-10">{it.label}</span>
            </button>
          )
        })}
      </nav>

      {!esBarbero && (
        <button
          onClick={() => navegarA(`/c/${negocio?.slug}`)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
        >
          <Globe size={20} /> Ver página pública
        </button>
      )}

      <motion.div
        whileHover={{ y: -2 }}
        className="mt-auto px-3 py-3 rounded-xl bg-black/5 text-xs text-[var(--fg-muted)]"
      >
        <p className="font-semibold text-[var(--fg)]">{nombreLabel(session, esBarbero)}</p>
        <p>{esBarbero ? "Perfil de barbero" : `Dueño · ${negocio?.nombre}`}</p>
        <button
          onClick={logout}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[var(--fg-muted)] hover:text-red-500 transition-colors"
        >
          <SignOut size={14} /> Cerrar sesión
        </button>
      </motion.div>
    </aside>
  )
}

function nombreLabel(session, esBarbero) {
  if (esBarbero) return session?.usuarioId ? "Barbero" : "Barbero"
  return "Dueño"
}