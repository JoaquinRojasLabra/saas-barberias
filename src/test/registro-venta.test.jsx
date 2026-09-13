import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"
import { formatCLP, hoyKey } from "@/lib/format"

const mocks = {
  onClose: vi.fn(),
  onSave: vi.fn(),
  toast: vi.fn(),
  clientes: [{ id: "c1", nombre: "Juan Pérez", telefono: "+56911112222", notas: "No teñir" }],
  servicios: [{ id: "s1", nombre: "Corte", precio: 12000 }],
  empleados: [{ id: "e1", nombre: "Carlos", barbero: true }],
  addVenta: vi.fn(),
  generarLinkPago: vi.fn(),
  esBarbero: false,
  session: { barberoId: "e1" },
  negocio: { id: "n1", nombre: "El Cauce" },
  datosPago: { efectivo: true, transferencia: false, mp: false, mpConfigurado: false },
  windowOpen: vi.fn(),
}

vi.mock("@/context/store", () => ({
  useStore: () => ({
    clientes: mocks.clientes,
    servicios: mocks.servicios,
    empleados: mocks.empleados,
    addVenta: mocks.addVenta,
    generarLinkPago: mocks.generarLinkPago,
    esBarbero: mocks.esBarbero,
    session: mocks.session,
    negocio: mocks.negocio,
    datosPago: mocks.datosPago,
  }),
}))
vi.mock("@/lib/toast", () => ({ useToast: () => mocks.toast }))

import RegistroVenta from "@/components/ventas/RegistroVenta"

beforeEach(() => {
  vi.clearAllMocks()
  mocks.esBarbero = false
  mocks.datosPago = { efectivo: true, transferencia: false, mp: false, mpConfigurado: false }
  mocks.addVenta.mockResolvedValue({ id: "v1" })
  mocks.generarLinkPago.mockResolvedValue({ init_point: "https://mp.test/pay" })
  window.open = mocks.windowOpen
})

describe("RegistroVenta", () => {
  it("precarga cliente, servicio, fecha/hora por defecto y empleado", () => {
    render(<RegistroVenta onClose={mocks.onClose} />)
    expect(screen.getByRole("heading", { name: "Registrar venta" })).toBeInTheDocument()
    expect(screen.getByLabelText(/Cliente/)).toHaveValue("c1")
    expect(screen.getByLabelText(/Servicio/)).toHaveValue("s1")
    expect(screen.getByLabelText(/Fecha y hora/)).toHaveValue(`${hoyKey()}T10:30`)
    expect(screen.getByLabelText("Empleado")).toHaveValue("e1")
    expect(screen.getByText(`Total: ${formatCLP(12000)}`)).toBeInTheDocument()
  })

  it("barbero no ve selector de empleado", () => {
    mocks.esBarbero = true
    render(<RegistroVenta onClose={mocks.onClose} />)
    expect(screen.queryByLabelText("Empleado")).not.toBeInTheDocument()
  })

  it("solo ofrece métodos de pago configurados", () => {
    mocks.datosPago = { efectivo: true, transferencia: true, mp: true, mpConfigurado: true }
    render(<RegistroVenta onClose={mocks.onClose} />)
    const select = screen.getByLabelText(/Método de pago/)
    expect(Array.from(select.options).map((o) => o.textContent)).toEqual(["Efectivo", "Transferencia", "Mercado Pago"])
  })

  it("registra la venta efectivo y cierra", async () => {
    render(<RegistroVenta onClose={mocks.onClose} onSave={mocks.onSave} />)
    fireEvent.click(screen.getByRole("button", { name: "Registrar venta" }))
    await vi.waitFor(() => expect(mocks.onClose).toHaveBeenCalled())
    expect(mocks.addVenta).toHaveBeenCalledWith({
      clienteId: "c1",
      servicioId: "s1",
      monto: 12000,
      fechaHora: `${hoyKey()}T10:30`,
      empleadoId: "e1",
      metodo: "Efectivo",
    })
    expect(mocks.onSave).toHaveBeenCalled()
    expect(mocks.toast).toHaveBeenCalledWith("Venta registrada")
    expect(mocks.windowOpen).not.toHaveBeenCalled()
  })

  it("con Mercado Pago genera link y abre la ventana de pago", async () => {
    mocks.datosPago = { efectivo: true, transferencia: false, mp: true, mpConfigurado: true }
    render(<RegistroVenta onClose={mocks.onClose} />)
    fireEvent.change(screen.getByLabelText(/Método de pago/), { target: { value: "Mercado Pago" } })
    expect(screen.getByText(/Se generará un pago de Mercado Pago/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Registrar venta" }))
    await vi.waitFor(() => expect(mocks.generarLinkPago).toHaveBeenCalled())
    expect(mocks.generarLinkPago).toHaveBeenCalledWith({
      negocioId: "n1",
      ventaId: "v1",
      monto: 12000,
      concepto: "Corte",
    })
    expect(mocks.windowOpen).toHaveBeenCalledWith("https://mp.test/pay", "_blank", "noopener")
    expect(mocks.toast).toHaveBeenCalledWith("Pago en línea generado")
  })

  it("muestra error si falla el registro", async () => {
    mocks.addVenta.mockRejectedValue(new Error("sin stock"))
    render(<RegistroVenta onClose={mocks.onClose} />)
    fireEvent.click(screen.getByRole("button", { name: "Registrar venta" }))
    await vi.waitFor(() => expect(mocks.toast).toHaveBeenCalledWith("sin stock", "error"))
    expect(mocks.onClose).not.toHaveBeenCalled()
  })

  it("deshabilita registrar sin cliente", () => {
    mocks.clientes = []
    render(<RegistroVenta onClose={mocks.onClose} />)
    expect(screen.getByRole("button", { name: "Registrar venta" })).toBeDisabled()
  })

  it("cierra con Escape", () => {
    render(<RegistroVenta onClose={mocks.onClose} />)
    fireEvent.keyDown(window, { key: "Escape" })
    expect(mocks.onClose).toHaveBeenCalled()
  })
})
