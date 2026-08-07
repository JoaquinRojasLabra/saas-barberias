import { useEffect } from "react"
import { motion } from "framer-motion"
import { CalendarCheck, Phone, MapPin, Clock, ArrowRight, Scissors, PaintBrush, Drop, Sparkle, UserFocus } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { useTheme } from "@/lib/theme"
import { formatCLP } from "@/lib/format"
import { navegarA, leerRuta, parametrosDe } from "@/lib/router"
import Logo3D from "@/components/public/Logo3D"
import Background from "@/components/Background"

const iconoDeServicio = (nombre) => {
  const n = (nombre || "").toLowerCase()
  if (n.includes("tinte") || n.includes("color") || n.includes("luz")) return PaintBrush
  if (n.includes("barba")) return Scissors
  if (n.includes("hidrat") || n.includes("tratamiento")) return Drop
  if (n.includes("afeit")) return UserFocus
  if (n.includes("ceja") || n.includes("perfil")) return Sparkle
  return Scissors
}

export default function PublicPage() {
  const { negocio, servicios, empleados } = useStore()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const { query } = leerRuta()
    const { tema } = parametrosDe(query)
    setTheme(tema || negocio.tema || "elegante")
  }, [negocio.tema, setTheme])

  return (
    <div key={theme} className="min-h-screen text-[var(--fg)] relative overflow-hidden">
      <Background />
      <div className="max-w-5xl mx-auto px-6 py-12 sm:py-16 relative z-10">
        <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center text-center gap-4">
          <Logo3D />
          <p className="uppercase tracking-[0.2em] text-xs text-[var(--fg-muted)]">Tu barbería</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight">{negocio.nombre}</h1>
          <p className="text-[var(--fg-muted)] max-w-xl">{negocio.direccion}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--fg-muted)]">
            <span className="flex items-center gap-1"><MapPin size={14} /> Santiago</span>
            <span className="flex items-center gap-1"><Clock size={14} /> 09:00 – 18:00</span>
            <span className="flex items-center gap-1"><Phone size={14} /> {negocio.telefono}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              const { query } = leerRuta()
              const { tema } = parametrosDe(query)
              navegarA(`/c/${negocio.slug}/reserva${tema ? `?tema=${tema}` : ""}`)
            }}
            className="mt-4 inline-flex items-center gap-2 bg-[var(--accent)] text-white font-semibold px-6 py-3 rounded-2xl shadow-[var(--shadow-lg)]"
          >
            <CalendarCheck size={20} weight="bold" /> Reservar hora
            <ArrowRight size={18} weight="bold" />
          </motion.button>
        </motion.header>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-14">
          <h2 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-widest mb-4 flex items-center gap-2"><Scissors size={16} /> Servicios</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicios.map((s, i) => {
              const Icon = iconoDeServicio(s.nombre)
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 26, delay: 0.25 + i * 0.07 }}
                  whileHover={{ y: -4 }}
                  className="group surface surface-highlight p-5 relative overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[var(--accent)]/10 blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />
                  <div className="flex items-center justify-between">
                    <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-white shadow-[var(--shadow)]">
                      <Icon size={22} weight="duotone" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">{s.duracion} min</span>
                  </div>
                  <p className="mt-4 text-sm font-bold">{s.nombre}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-lg font-extrabold tracking-tight">{formatCLP(s.precio)}</p>
                    <ArrowRight size={16} weight="bold" className="text-[var(--fg-muted)] opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[var(--accent)]" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-14">
          <h2 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-widest mb-4">Nuestro equipo</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {empleados.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.06 }}
                whileHover={{ y: -3 }}
                className="surface p-3 flex items-center gap-3"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-white font-bold text-sm shrink-0">
                  {e.nombre[0]}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{e.nombre}</p>
                  <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider">Barbero</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
