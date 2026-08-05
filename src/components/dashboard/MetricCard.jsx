import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function MetricCard({ icon: Icon, label, value, sub, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 shadow-[var(--shadow)]"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">{label}</p>
        <span className="text-[var(--accent)]"><Icon size={20} weight="duotone" /></span>
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight">{value}</p>
      {sub && <p className={cn("mt-1 text-xs", sub.className || "text-[var(--fg-muted)]")}>{sub.text}</p>}
    </motion.div>
  )
}
