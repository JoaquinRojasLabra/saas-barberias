import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"
import { hoyKey, formatCLP } from "@/lib/format"

const hoy = hoyKey()

const mocks = {
  esBarbero: false,
  session: { barberoId: "b1" },
  empleados: [{ id: "b1", nombre: "Sebastián" }],
  qrStats: [
    { id: "q1", fechaHora: `${hoy}T10:00` },
    { id: "q2", fechaHora: `${hoy}T11:00` },
    { id: "q3", fechaHora: `${hoy}T12:00` },
  ],
  scope: {
    turnos: [
      { id: "t1", fecha: hoy, estado: "confirmado" },
      { id: "t2", fecha: hoy, estado: "no-llego" },
      { id: "t3", fecha: "1999-01-01", estado: "confirmado" },
    ],
    ventas: [
      { id: "v1", fechaHora: `${hoy}T10:00`, monto: 10000 },
      { id: "v2", fechaHora: `${hoy}T11:00`, monto: 5000 },
      { id: "v3", fechaHora: "1999-01-01T10:00", monto: 99999 },
    ],
  },
  setView: vi.fn(),
}

vi.mock("@/context/store", () => ({
  useStore: () => ({
    scope: mocks.scope,
    qrStats: mocks.qrStats,
    esBarbero: mocks.esBarbero,
    session: mocks.session,
    empleados: mocks.empleados,
    setView: mocks.setView,
  }),
}))
vi.mock("@/components/CountUp", () => ({
  default: ({ n, format }) => <span>{format ? format(n) : n.toLocaleString("es-CL")}</span>,
}))

import Dashboard from "@/components/dashboard/Dashboard"

beforeEach(() => {
  vi.clearAllMocks()
  mocks.esBarbero = false
})

describe("Dashboard", () => {
  it("dueño ve 'Panel del negocio' y 'Todo el local'", () => {
    render(<Dashboard />)
    expect(screen.getByRole("heading", { name: "Panel del negocio" })).toBeInTheDocument()
    expect(screen.getByText("Todo el local")).toBeInTheDocument()
  })

  it("barbero saluda por nombre y ve 'Tu actividad'", () => {
    mocks.esBarbero = true
    render(<Dashboard />)
    expect(screen.getByRole("heading", { name: "Hola, Sebastián" })).toBeInTheDocument()
    expect(screen.getByText("Tu actividad")).toBeInTheDocument()
  })

  it("suma solo las ventas de hoy", () => {
    render(<Dashboard />)
    expect(screen.getByText(formatCLP(15000))).toBeInTheDocument()
  })

  it("cuenta turnos de hoy y los no-llegó", () => {
    render(<Dashboard />)
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByText("revisa agenda")).toBeInTheDocument()
  })

  it("no muestra 'revisa agenda' si no hay no-llegó", () => {
    mocks.scope.turnos = [{ id: "t1", fecha: hoy, estado: "confirmado" }]
    render(<Dashboard />)
    expect(screen.getByText("0")).toBeInTheDocument()
    expect(screen.getByText("todo perfecto")).toBeInTheDocument()
    expect(screen.queryByText("revisa agenda")).not.toBeInTheDocument()
  })

  it("muestra la meta del día y los escaneos QR", () => {
    render(<Dashboard />)
    expect(screen.getByText(`Meta ${formatCLP(15000)}`)).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
  })

  it("cuenta escaneos solo de esta semana", () => {
    const antes = mocks.scope.turnos
    const antesQr = mocks.qrStats
    mocks.qrStats = [
      { id: "q1", fechaHora: `${hoy}T10:00` },
      { id: "q2", fechaHora: `${hoy}T11:00` },
      { id: "q3", fechaHora: "2020-01-01T10:00" },
    ]
    mocks.scope.turnos = [{ id: "t1", fecha: hoy, estado: "confirmado" }]
    render(<Dashboard />)
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.queryByText("3")).not.toBeInTheDocument()
    mocks.scope.turnos = antes
    mocks.qrStats = antesQr
  })

  it("excluye turnos cancelados de 'Turnos hoy'", () => {
    const antes = mocks.scope.turnos
    mocks.scope.turnos = [
      { id: "t1", fecha: hoy, estado: "confirmado" },
      { id: "t2", fecha: hoy, estado: "no-llego" },
      { id: "t4", fecha: hoy, estado: "cancelado" },
      { id: "t3", fecha: "1999-01-01", estado: "confirmado" },
    ]
    render(<Dashboard />)
    expect(screen.getByText("2")).toBeInTheDocument()
    mocks.scope.turnos = antes
  })

  it("muestra los 7 días de la semana en el gráfico", () => {
    render(<Dashboard />)
    for (const d of ["L", "M", "X", "J", "V", "S", "D"]) {
      expect(screen.getByText(d)).toBeInTheDocument()
    }
  })

  it("muestra el estado vacío cuando no hay ningún registro", () => {
    const antes = mocks.scope
    mocks.scope = { turnos: [], ventas: [] }
    render(<Dashboard />)
    expect(screen.getByText("Sin actividad todavía")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Ir a ventas/i }))
    expect(mocks.setView).toHaveBeenCalledWith("ventas")
    mocks.scope = antes
  })
})
