import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function ParticleField() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    camera.position.z = 12

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    })
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const COUNT = 900
    const positions = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const points = new THREE.Points(geometry, material)
    scene.add(points)

    let w, h, raf
    const mouse = { x: 0, y: 0 }
    let target = { x: 0, y: 0 }

    const onResize = () => {
      w = mount.clientWidth || window.innerWidth
      h = mount.clientHeight || window.innerHeight
      renderer.setSize(w, h)
    }

    const onPointer = (e) => {
      target.x = (e.clientX - w / 2) / (w / 2)
      target.y = -(e.clientY - h / 2) / (h / 2)
    }

    const tick = () => {
      const dt = performance.now() * 0.00003
      points.rotation.y += dt * 0.002
      mouse.x += (target.x - mouse.x) * 0.04
      mouse.y += (target.y - mouse.y) * 0.04
      points.rotation.x += mouse.y * 0.0002
      points.rotation.y += mouse.x * 0.0002
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }

    onResize()
    window.addEventListener("resize", onResize)
    window.addEventListener("pointermove", onPointer)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("pointermove", onPointer)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="fixed inset-0 -z-[5] pointer-events-none" style={{ opacity: 0.5 }} />
}