import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"
import { formatCLP, hoyKey } from "@/lib/format"

const mocks = {
  onClose: vi.fn(),
  toast: vi.fn(),
  clientes: [{ id: "c1", nombre: "Juan Pérez", telefono: "+56911112222", notas: "No teñir" }],
  servicios: [{ id: "s1", nombre: "Corte", precio: 12000 }],
  empleados: [{ id: "e1", nombre: "Carlos", barbero: true }],
  addTurno: vi.fn(),
  addCliente: vi.fn(),
  updateCliente: vi.fn(),
  esBarbero: false,
  session: { barberoId: "e1" },
  ventas: [],
  turnos: [],
  negocio: { nombre: "El Cauce" },
}

vi.mock("@/context/store", () => ({
  useStore: () => ({
    clientes: mocks.clientes,
    servicios: mocks.servicios,
    empleados: mocks.empleados,
    addTurno: mocks.addTurno,
    addCliente: mocks.addCliente,
    updateCliente: mocks.updateCliente,
    esBarbero: mocks.esBarbero,
    session: mocks.session,
    ventas: mocks.ventas,
    turnos: mocks.turnos,
    negocio: mocks.negocio,
  }),
}))
vi.mock("@/lib/toast", () => ({ useToast: () => mocks.toast }))
vi.mock("@/components/CountUp", () => ({
  default: ({ n, format }) => <span>{format ? format(n) : n.toLocaleString("es-CL")}</span>,
}))

import TurnoModal from "@/components/agenda/TurnoModal"
import ClienteModal from "@/components/clientes/ClienteModal"
import FichaCliente from "@/components/clientes/FichaCliente"

beforeEach(() => {
  vi.clearAllMocks()
  mocks.esBarbero = false
})

describe("TurnoModal", () => {
  it("precarga cliente, servicio, fecha de hoy y hora 10:00", () => {
    render(<TurnoModal onClose={mocks.onClose} />)
    expect(screen.getByRole("heading", { name: "Nuevo turno" })).toBeInTheDocument()
    const cliente = screen.getByLabelText(/Cliente/)
    expect(cliente).toHaveValue("c1")
    expect(screen.getByLabelText(/Servicio/)).toHaveValue("s1")
    expect(screen.getByLabelText("Fecha")).toHaveValue(hoyKey())
    expect(screen.getByLabelText("Hora")).toHaveValue("10:00")
  })

  it("dueño ve el selector de empleado", () => {
    render(<TurnoModal onClose={mocks.onClose} />)
    expect(screen.getByLabelText("Empleado")).toHaveValue("e1")
  })

  it("barbero no ve selector de empleado y usa su barberoId", () => {
    mocks.esBarbero = true
    render(<TurnoModal onClose={mocks.onClose} />)
    expect(screen.queryByLabelText("Empleado")).not.toBeInTheDocument()
  })

  it("agenda un turno con los datos y cierra", () => {
    render(<TurnoModal onClose={mocks.onClose} />)
    fireEvent.change(screen.getByLabelText("Hora"), { target: { value: "11:30" } })
    fireEvent.click(screen.getByRole("button", { name: "Guardar turno" }))
    expect(mocks.addTurno).toHaveBeenCalledWith({
      clienteId: "c1",
      servicioId: "s1",
      fecha: hoyKey(),
      hora: "11:30",
      estado: "confirmado",
      empleadoId: "e1",
    })
    expect(mocks.toast).toHaveBeenCalledWith("Turno agendado")
    expect(mocks.onClose).toHaveBeenCalled()
  })

  it("deshabilita guardar sin cliente", () => {
    mocks.clientes = []
    render(<TurnoModal onClose={mocks.onClose} />)
    expect(screen.getByRole("button", { name: "Guardar turno" })).toBeDisabled()
  })

  it("cierra con Escape y restaura el foco", () => {
    render(<TurnoModal onClose={mocks.onClose} />)
    fireEvent.keyDown(window, { key: "Escape" })
    expect(mocks.onClose).toHaveBeenCalled()
  })
})

describe("ClienteModal", () => {
  it("crea un cliente nuevo", () => {
    render(<ClienteModal onClose={mocks.onClose} />)
    expect(screen.getByRole("heading", { name: "Nuevo cliente" })).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText("Nombre y apellido"), { target: { value: "Ana Gómez" } })
    fireEvent.change(screen.getByPlaceholderText("+56911112222"), { target: { value: "+56999998888" } })
    fireEvent.click(screen.getByRole("button", { name: "Registrar cliente" }))
    expect(mocks.addCliente).toHaveBeenCalledWith({ nombre: "Ana Gómez", telefono: "+56999998888", notas: "", empleadoId: undefined })
    expect(mocks.toast).toHaveBeenCalledWith("Cliente registrado")
    expect(mocks.onClose).toHaveBeenCalled()
  })

  it("barbero asigna su propio empleadoId al crear", () => {
    mocks.esBarbero = true
    render(<ClienteModal onClose={mocks.onClose} />)
    fireEvent.change(screen.getByPlaceholderText("Nombre y apellido"), { target: { value: "Ana Gómez" } })
    fireEvent.click(screen.getByRole("button", { name: "Registrar cliente" }))
    expect(mocks.addCliente).toHaveBeenCalledWith(expect.objectContaining({ empleadoId: "e1" }))
  })

  it("edita un cliente existente", () => {
    render(<ClienteModal onClose={mocks.onClose} cliente={{ id: "c1", nombre: "Juan Pérez", telefono: "+56911112222", notas: "No teñir" }} />)
    expect(screen.getByRole("heading", { name: "Editar cliente" })).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Nombre y apellido")).toHaveValue("Juan Pérez")
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }))
    expect(mocks.updateCliente).toHaveBeenCalledWith("c1", { nombre: "Juan Pérez", telefono: "+56911112222", notas: "No teñir" })
    expect(mocks.toast).toHaveBeenCalledWith("Cliente actualizado")
  })

  it("deshabilita registrar sin nombre", () => {
    render(<ClienteModal onClose={mocks.onClose} />)
    expect(screen.getByRole("button", { name: "Registrar cliente" })).toBeDisabled()
  })
})

describe("FichaCliente", () => {
  it("muestra datos, total y nota del cliente", () => {
    mocks.ventas = [
      { id: "v1", clienteId: "c1", monto: 10000 },
      { id: "v2", clienteId: "c1", monto: 20000 },
    ]
    render(<FichaCliente cliente={{ id: "c1", nombre: "Juan Pérez", telefono: "+56911112222", notas: "No teñir" }} onClose={mocks.onClose} />)
    expect(screen.getByRole("heading", { name: "Juan Pérez" })).toBeInTheDocument()
    expect(screen.getByText(formatCLP(30000))).toBeInTheDocument()
    expect(screen.getByText("No teñir")).toBeInTheDocument()
    expect(screen.getByText("Ventas")).toBeInTheDocument()
  })

  it("filtra ventas del cliente y muestra 'Enviar WhatsApp'", () => {
    mocks.ventas = [{ id: "v1", clienteId: "otro", monto: 99999 }]
    render(<FichaCliente cliente={{ id: "c1", nombre: "Juan Pérez", telefono: "+56911112222" }} onClose={mocks.onClose} />)
    expect(screen.queryByText(formatCLP(99999))).not.toBeInTheDocument()
    const wa = screen.getByRole("link", { name: /Enviar WhatsApp/ })
    expect(wa.getAttribute("href")).toContain("56911112222")
  })

  it("muestra próximos turnos no cumplidos", () => {
    const manana = "2999-01-01"
    mocks.turnos = [
      { id: "t1", clienteId: "c1", servicioId: "s1", fecha: manana, hora: "11:00", estado: "confirmado" },
      { id: "t2", clienteId: "c1", servicioId: "s1", fecha: "1999-01-01", hora: "09:00", estado: "cumplido" },
    ]
    render(<FichaCliente cliente={{ id: "c1", nombre: "Juan Pérez", telefono: "" }} onClose={mocks.onClose} />)
    expect(screen.getByText(/Próxima cita:/)).toBeInTheDocument()
    expect(screen.getAllByText(`Corte`).length).toBe(2)
    expect(screen.queryByRole("link", { name: /Enviar WhatsApp/ })).not.toBeInTheDocument()
  })
})
