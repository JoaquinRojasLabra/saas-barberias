import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import React from "react"
import { hoyKey } from "@/lib/format"

const hoy = hoyKey()

const mocks = {
  esBarbero: false,
  session: { usuarioId: "u1" },
  scope: { turnos: [] },
  turnos: [],
  clientes: [{ id: "c1", nombre: "Ana" }],
  servicios: [{ id: "s1", nombre: "Corte" }],
  setTurnoEstado: vi.fn(),
}

vi.mock("@/context/store", () => ({
  useStore: () => ({
    turnos: mocks.turnos,
    scope: mocks.scope,
    clientes: mocks.clientes,
    servicios: mocks.servicios,
    setTurnoEstado: mocks.setTurnoEstado,
    esBarbero: mocks.esBarbero,
    session: mocks.session,
  }),
}))

import Agenda from "@/components/agenda/Agenda"

beforeEach(() => {
  vi.clearAllMocks()
  mocks.esBarbero = false
  mocks.scope = { turnos: [] }
})

describe("Agenda", () => {
  it("solo muestra los turnos del día de hoy", () => {
    mocks.turnos = [
      { id: "t1", fecha: hoy, hora: "10:00", estado: "confirmado", clienteId: "c1", servicioId: "s1" },
      { id: "t2", fecha: "2020-01-01", hora: "11:00", estado: "confirmado", clienteId: "c1", servicioId: "s1" },
    ]
    render(<Agenda />)
    expect(screen.getByText("10:00 · Corte")).toBeInTheDocument()
    expect(screen.queryByText("11:00 · Corte")).not.toBeInTheDocument()
  })

  it("muestra mensaje cuando no hay turnos hoy", () => {
    mocks.turnos = [{ id: "t2", fecha: "2020-01-01", hora: "11:00", estado: "confirmado", clienteId: "c1", servicioId: "s1" }]
    render(<Agenda />)
    expect(screen.getByText("No hay turnos agendados.")).toBeInTheDocument()
    expect(screen.queryByText("11:00 · Corte")).not.toBeInTheDocument()
  })

  it("barbero ve los turnos de su scope de hoy", () => {
    mocks.esBarbero = true
    mocks.scope = {
      turnos: [
        { id: "t1", fecha: hoy, hora: "10:00", estado: "confirmado", clienteId: "c1", servicioId: "s1" },
        { id: "t2", fecha: "2020-01-01", hora: "11:00", estado: "confirmado", clienteId: "c1", servicioId: "s1" },
      ],
    }
    render(<Agenda />)
    expect(screen.getByText("10:00 · Corte")).toBeInTheDocument()
    expect(screen.queryByText("11:00 · Corte")).not.toBeInTheDocument()
  })
})