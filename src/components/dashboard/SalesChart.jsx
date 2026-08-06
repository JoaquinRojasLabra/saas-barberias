import { motion } from "framer-motion"

export default function SalesChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="surface surface-hover p-5">
      <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-4">Ventas de la semana</p>
      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((d, i) => (
          <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / max) * 100}%` }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-8 rounded-t-lg bg-[var(--accent)]"
            />
            <span className="text-[10px] text-[var(--fg-muted)]">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
