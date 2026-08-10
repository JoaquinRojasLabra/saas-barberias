import { useEffect } from "react"
import { motion } from "framer-motion"
import { CalendarCheck, Phone, MapPin, Clock, ArrowRight, Scissors, PaintBrush, Drop, Sparkle, UserFocus, Camera } from "@phosphor-icons/react"
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

export default function PublicPage({ slug }) {
  const { negocio, servicios, empleados, activarPorSlug, error, galeria } = useStore()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (slug) activarPorSlug(slug)
  }, [slug, activarPorSlug])

  useEffect(() => {
    const { query } = leerRuta()
    const { tema } = parametrosDe(query)
    setTheme(tema || negocio?.tema || "elegante")
  }, [negocio?.tema, setTheme])

  if (!negocio && error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <Background />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center space-y-4 max-w-sm">
          <span className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent)] text-white">
            <Scissors size={28} weight="duotone" />
          </span>
          <h1 className="font-display text-2xl font-black tracking-tight">Barbería no encontrada</h1>
          <p className="text-sm text-[var(--fg-muted)]">Revisa el enlace o escanea nuevamente el QR.</p>
          <button onClick={() => navegarA("/")} className="inline-flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
            Ir al inicio
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div key={theme} className="min-h-screen text-[var(--fg)] relative overflow-hidden">
      <Background />
      <div className="max-w-5xl mx-auto px-6 py-12 sm:py-16 relative z-10">
        <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center text-center gap-4">
          {negocio?.logoTipo === "imagen" && negocio?.logoUrl ? (
            <img src={negocio.logoUrl} alt={negocio?.nombre || "Logo"} className="w-24 h-24 rounded-3xl object-cover shadow-[var(--shadow-lg)]" />
          ) : (
            <Logo3D color={negocio?.accentColor || undefined} />
          )}
          <p className="uppercase tracking-[0.2em] text-xs text-[var(--fg-muted)]">Tu barbería</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight">{negocio?.nombre}</h1>
          <p className="text-[var(--fg-muted)] max-w-xl">{negocio?.direccion}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--fg-muted)]">
            {negocio?.ciudad && <span className="flex items-center gap-1"><MapPin size={14} /> {negocio.ciudad}</span>}
            {negocio?.horaApertura && negocio?.horaCierre && (
              <span className="flex items-center gap-1"><Clock size={14} /> {negocio.horaApertura} – {negocio.horaCierre}</span>
            )}
            {negocio?.telefono && <span className="flex items-center gap-1"><Phone size={14} /> {negocio.telefono}</span>}
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              const { query } = leerRuta()
              const { tema } = parametrosDe(query)
              navegarA(`/c/${negocio?.slug || slug}/reserva${tema ? `?tema=${tema}` : ""}`)
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

        {negocio?.mostrarGaleria && galeria.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mt-14">
            <h2 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-widest mb-4 flex items-center gap-2"><Camera size={16} /> Nuestros trabajos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {galeria.map((g, i) => (
                <motion.div
                  key={g.id || i}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="overflow-hidden rounded-2xl border border-[var(--border)]"
                >
                  <img src={g.url} alt={`Trabajo ${i + 1}`} className="w-full aspect-square object-cover hover:scale-105 transition-transform cursor-pointer" loading="lazy" />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

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
