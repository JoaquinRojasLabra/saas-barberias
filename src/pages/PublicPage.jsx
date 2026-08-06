import { motion } from "framer-motion"
import { CalendarCheck, Phone, MapPin, Clock, ArrowRight, Scissors } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { useTheme } from "@/lib/theme"
import { formatCLP } from "@/lib/format"
import { navegarA } from "@/lib/router"
import Logo3D from "@/components/public/Logo3D"

export default function PublicPage() {
  const { negocio, servicios, empleados } = useStore()
  const { theme } = useTheme()

  return (
    <div key={theme} className="min-h-screen bg-[var(--bg)] text-[var(--fg)] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
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
            onClick={() => navegarA(`/c/${negocio.slug}/reserva`)}
            className="mt-4 inline-flex items-center gap-2 bg-[var(--accent)] text-white font-semibold px-6 py-3 rounded-2xl shadow-[var(--shadow-lg)]"
          >
            <CalendarCheck size={20} weight="bold" /> Reservar hora
            <ArrowRight size={18} weight="bold" />
          </motion.button>
        </motion.header>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-14">
          <h2 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-widest mb-4 flex items-center gap-2"><Scissors size={16} /> Servicios</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicios.map((s) => (
              <div key={s.id} className="surface surface-hover p-5">
                <p className="text-sm font-bold">{s.nombre}</p>
                <p className="text-xs text-[var(--fg-muted)]">{s.duracion} min</p>
                <p className="mt-2 text-sm font-extrabold">{formatCLP(s.precio)}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-14">
          <h2 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-widest mb-4">Nuestro equipo</h2>
          <div className="flex flex-wrap gap-3">
            {empleados.map((e) => (
              <span key={e.id} className="surface px-4 py-2 text-sm font-medium">{e.nombre}</span>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
