import { motion } from "framer-motion"

export default function Cargando({ mensaje = "Cargando…" }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-24"
      role="status"
      aria-live="polite"
    >
      <motion.svg
        width="42"
        height="42"
        viewBox="0 0 24 24"
        fill="none"
        role="presentation"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      >
        <circle cx="12" cy="12" r="9" stroke="var(--bg-card)" strokeWidth="3" />
        <path
          d="M12 3a9 9 0 0 1 9 9"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </motion.svg>
      <p className="text-sm font-medium text-[var(--fg-muted)]">{mensaje}</p>
    </div>
  )
}