import { useState, useEffect } from "react"

const separa = (hash) => {
  const s = hash.replace(/^#/, "") || "/"
  const [path, query] = s.split("?")
  return { path: path || "/", query: query || "" }
}

export function leerRuta() {
  if (typeof window === "undefined") return { path: "/", query: "" }
  return separa(window.location.hash)
}

export function navegarA(ruta) {
  window.location.hash = ruta
}

export function esPublica(path) {
  return /^\/c\//.test(path)
}

export function slugDe(path) {
  const m = path.match(/^\/c\/([^/]+)(\/.*)?$/)
  return m ? m[1] : ""
}

export function parametrosDe(query) {
  return Object.fromEntries(new URLSearchParams(query))
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => leerRuta())
  useEffect(() => {
    const on = () => setRoute(leerRuta())
    window.addEventListener("hashchange", on)
    return () => window.removeEventListener("hashchange", on)
  }, [])
  return route
}
