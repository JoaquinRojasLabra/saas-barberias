import { createContext, useContext, useState, useEffect } from "react"
import { negocio as negocioMock, servicios as serviciosMock, clientesMock, turnosMock, ventasMock, qrStatsMock, empleados, slotsHorario } from "@/data/mock"

const StoreContext = createContext()

const KEY = "saas-barberias:v1"

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(`${KEY}:${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function StoreProvider({ children }) {
  const [negocio, setNegocio] = useState(() => load("negocio", negocioMock))
  const [servicios, setServicios] = useState(() => load("servicios", serviciosMock))
  const [turnos, setTurnos] = useState(() => load("turnos", turnosMock))
  const [clientes, setClientes] = useState(() => load("clientes", clientesMock))
  const [ventas, setVentas] = useState(() => load("ventas", ventasMock))
  const [qrStats, setQrStats] = useState(() => load("qrStats", qrStatsMock))
  const [preferencias, setPreferencias] = useState(() => load("preferencias", {
    horasRecordatorio: 2,
    whatsappNumero: negocioMock.telefono,
  }))
  const [view, setView] = useState("dashboard")

  const persist = (key, value) => {
    try {
      localStorage.setItem(`${KEY}:${key}`, JSON.stringify(value))
    } catch {
      /* almacenamiento lleno o no disponible */
    }
  }

  useEffect(() => persist("negocio", negocio), [negocio])
  useEffect(() => persist("servicios", servicios), [servicios])
  useEffect(() => persist("turnos", turnos), [turnos])
  useEffect(() => persist("clientes", clientes), [clientes])
  useEffect(() => persist("ventas", ventas), [ventas])
  useEffect(() => persist("qrStats", qrStats), [qrStats])
  useEffect(() => persist("preferencias", preferencias), [preferencias])

  const updateNegocio = (patch) => setNegocio((prev) => ({ ...prev, ...patch }))

  const updatePreferencias = (patch) => setPreferencias((prev) => ({ ...prev, ...patch }))

  const addVenta = (venta) => {
    const v = { id: `v${Date.now()}`, ...venta }
    setVentas((prev) => [v, ...prev])
    return v
  }

  const addTurno = (turno) => setTurnos((prev) => [{ id: `t${Date.now()}`, ...turno }, ...prev])

  const tomarCita = ({ clienteId, servicioId, fecha, hora, empleadoId }) => {
    const t = { id: `t${Date.now()}`, clienteId, servicioId, fecha, hora, estado: "confirmado", empleadoId, origen: "web-publico" }
    setTurnos((prev) => [t, ...prev])
    return t
  }

  const generarLinkPago = (monto, concepto) => {
    const ref = `MP-${Date.now()}`
    return { ref, url: `https://mp.la/${ref}`, monto, concepto }
  }

  const setTurnoEstado = (id, estado) =>
    setTurnos((prev) => prev.map((t) => (t.id === id ? { ...t, estado } : t)))

  const addQrScan = (fuente) =>
    setQrStats((prev) => [{ id: `q${Date.now()}`, fechaHora: new Date().toISOString(), fuente }, ...prev])

  const addCliente = (cliente) => {
    const c = { id: `c${Date.now()}`, visitas: 0, ...cliente }
    setClientes((prev) => [c, ...prev])
    return c
  }

  const updateCliente = (id, patch) =>
    setClientes((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))

  const addServicio = (servicio) => {
    const s = { id: `s${Date.now()}`, ...servicio }
    setServicios((prev) => [...prev, s])
    return s
  }

  const updateServicio = (id, patch) =>
    setServicios((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))

  const removeServicio = (id) =>
    setServicios((prev) => prev.filter((s) => s.id !== id))

  const value = {
    negocio, servicios, empleados, slotsHorario,
    turnos, clientes, ventas, qrStats, preferencias,
    view, setView,
    updateNegocio, updatePreferencias, addVenta, addTurno, setTurnoEstado, addQrScan,
    tomarCita, generarLinkPago,
    addCliente, updateCliente, addServicio, updateServicio, removeServicio,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within a StoreProvider")
  return ctx
}
