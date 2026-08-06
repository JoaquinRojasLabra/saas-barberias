import { useEffect, useRef } from "react"
import gsap from "gsap"

export default function CountUp({ n, format, duration = 1.2, delay = 0 }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof n !== "number") return
    const state = { v: 0 }
    const tween = gsap.to(state, {
      v: n,
      duration,
      delay,
      ease: "power3.out",
      onUpdate: () => {
        el.textContent = format ? format(state.v) : Math.round(state.v).toLocaleString("es-CL")
      },
    })
    return () => {
      tween.kill()
    }
  }, [n, format, duration, delay])

  if (typeof n !== "number") return <>{n}</>
  return <span ref={ref}>{format ? format(0) : 0}</span>
}