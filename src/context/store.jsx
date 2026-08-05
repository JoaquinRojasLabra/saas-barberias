import { createContext, useContext, useState } from "react"
import { negocio, servicios, clientesMock, turnosMock, ventasMock, qrStatsMock, empleados } from "@/data/mock"

const StoreContext = createContext()

export function StoreProvider({ children }) {
  const [turnos, setTurnos] = useState(turnosMock)
  const [clientes, setClientes] = useState(clientesMock)
  const [ventas, setVentas] = useState(ventasMock)
  const [qrStats, setQrStats] = useState(qrStatsMock)
  const [view, setView] = useState("dashboard")

  const addVenta = (venta) => {
    const v = { id: `v${Date.now()}`, ...venta }
    setVentas((prev) => [v, ...prev])
    return v
  }

  const addTurno = (turno) => setTurnos((prev) => [...prev, { id: `t${Date.now()}`, ...turno }])

  const setTurnoEstado = (id, estado) =>
    setTurnos((prev) => prev.map((t) => (t.id === id ? { ...t, estado } : t)))

  const addQrScan = (fuente) =>
    setQrStats((prev) => [...prev, { id: `q${Date.now()}`, fechaHora: new Date().toISOString(), fuente }])

  const value = {
    negocio, servicios, empleados,
    turnos, clientes, ventas, qrStats,
    view, setView,
    addVenta, addTurno, setTurnoEstado, addQrScan,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)
