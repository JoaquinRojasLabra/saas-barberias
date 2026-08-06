import { motion } from "framer-motion"
import CountUp from "@/components/CountUp"

export default function ProgressRing({ value, max, label }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const R = 54
  const C = 2 * Math.PI * R
  const len = (C * pct) / 100

  return (
    <div className="flex flex-col items-center justify-center gap-3 surface surface-hover rounded-2xl p-6">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--ring-track)" strokeWidth="10" />
        <motion.circle
          cx="70" cy="70" r={R} fill="none"
          stroke="var(--accent)" strokeWidth="10" strokeLinecap="round"
          transform="rotate(-90 70 70)"
          initial={{ strokeDasharray: "0 1000" }}
          animate={{ strokeDasharray: `${len} ${C}` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="text-center">
        <p className="text-3xl font-extrabold tracking-tight"><CountUp n={pct} format={(v) => `${Math.round(v)}%`} /></p>
        <p className="text-xs text-[var(--fg-muted)]">{label}</p>
      </div>
    </div>
  )
}
