import { useEffect, useRef } from "react"
import gsap from "gsap"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function MetricCard({ icon: Icon, label, value, sub, delay = 0 }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 16, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        delay,
        ease: "power3.out",
        overwrite: true,
      },
    )
    return () => {
      tween.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      ref={ref}
      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 shadow-[var(--shadow)]"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
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
