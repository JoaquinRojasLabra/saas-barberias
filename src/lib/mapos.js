const SNAKE = (k) => k.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase())
const CAMEL = (k) => k.replace(/_([a-z])/g, (_, l) => l.toUpperCase())

export function filaAFront(fila) {
  if (!fila) return null
  const out = {}
  for (const k of Object.keys(fila)) out[CAMEL(k)] = fila[k]
  return out
}

export function frontAFila(nombre, obj) {
  const out = {}
  for (const k of Object.keys(obj)) if (obj[k] !== undefined && obj[k] !== null) out[SNAKE(k)] = obj[k]
  return out
}

export const mapaDe = (filas) => (filas || []).map(filaAFront)