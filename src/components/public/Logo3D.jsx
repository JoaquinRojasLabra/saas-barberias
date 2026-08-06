import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function Logo3D({ seed = 0, size = 160 }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.z = 5
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(size, size)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#0e7490"
    const geo = new THREE.IcosahedronGeometry(1.4, 1)
    const mat = new THREE.MeshStandardMaterial({
      color: accent,
      metalness: 0.85,
      roughness: 0.22,
      flatShading: true,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = 0.4
    mesh.rotation.y = 0.6
    scene.add(mesh)

    const light1 = new THREE.DirectionalLight(0xffffff, 1.6)
    light1.position.set(3, 4, 5)
    scene.add(light1)
    const light2 = new THREE.DirectionalLight(0x8899ff, 0.7)
    light2.position.set(-3, -2, -4)
    scene.add(light2)
    scene.add(new THREE.AmbientLight(0xffffff, 0.4))

    let raf = 0
    const loop = (t) => {
      mesh.rotation.x = 0.4 + Math.sin(t * 0.0006) * 0.25
      mesh.rotation.y = 0.6 + t * 0.0004
      renderer.render(scene, camera)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      renderer.dispose()
      mount.removeChild(renderer.domElement)
      geo.dispose()
      mat.dispose()
    }
  }, [size, seed])

  return <div ref={mountRef} style={{ width: size, height: size }} aria-hidden />
}
