import { motion } from "framer-motion"

export default function EstadoVacio({ icono: Icono, titulo, descripcion, cta, onCta }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
        {Icono && <Icono size={28} weight="duotone" />}
      </span>
      <div className="space-y-1">
        <p className="text-base font-extrabold tracking-tight">{titulo}</p>
        {descripcion && <p className="text-sm text-[var(--fg-muted)]">{descripcion}</p>}
      </div>
      {cta && onCta && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCta}
          className="mt-2 inline-flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
        >
          {cta}
        </motion.button>
      )}
    </div>
  )
}