import { motion, useReducedMotion } from "framer-motion"

const GRAIN = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E`

export default function Background() {
  const reduce = useReducedMotion()

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-[var(--bg)]">
      {/* Orbes de ambiente por tema */}
      <motion.div
        className="absolute rounded-full blur-[90px]"
        style={{ background: "var(--orb-1)", width: "42rem", height: "42rem", top: "-12rem", left: "-10rem" }}
        animate={reduce ? undefined : { x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full blur-[100px]"
        style={{ background: "var(--orb-2)", width: "36rem", height: "36rem", bottom: "-14rem", right: "-8rem" }}
        animate={reduce ? undefined : { x: [0, -50, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full blur-[80px]"
        style={{ background: "var(--orb-3)", width: "30rem", height: "30rem", top: "30%", left: "55%" }}
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 60, 0], scale: [1.1, 0.95, 1.1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grano cinematográfico */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("${GRAIN}")`,
          opacity: "var(--grain-opacity)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Patrón de textura por tema (grid de puntos, veta de arcilla, etc.) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "var(--bg-pattern)",
          backgroundSize: "var(--bg-pattern-size)",
          opacity: "var(--bg-pattern-opacity)",
        }}
      />
    </div>
  )
}