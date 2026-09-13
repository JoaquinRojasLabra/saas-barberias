import { motion } from "framer-motion"
import { WarningCircle } from "@phosphor-icons/react"

export default function EstadoError({ mensaje, onReintentar }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
        <WarningCircle size={28} weight="duotone" />
      </span>
      <div className="space-y-1">
        <p className="text-lg font-extrabold tracking-tight">Algo salió mal</p>
        {mensaje && <p className="text-sm text-[var(--fg-muted)]">{mensaje}</p>}
      </div>
      {onReintentar && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReintentar}
          className="mt-1 inline-flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
        >
          Reintentar
        </motion.button>
      )}
    </div>
  )
}