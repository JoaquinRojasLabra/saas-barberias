import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"
import { hoyKey } from "@/lib/format"

const hoy = hoyKey()

const mocks = {
  negocio: { id: "n1", nombre: "El Cauce", telefono: "+56911112222", tema: "elegante", slug: "el-cauce" },
  servicios: [
    { id: "s1", nombre: "Corte", precio: 12000, duracion: 45 },
    { id: "s2", nombre: "Barba", precio: 8000, duracion: 30 },
  ],
  empleados: [
    { id: "e1", nombre: "Carlos" },
    { id: "e2", nombre: "María" },
  ],
  slotsHorario: ["10:00", "10:30", "11:00", "11:30"],
  datosPago: { efectivo: true, transferencia: false, mp: false, mpConfigurado: false },
  tomarCita: vi.fn(),
  horariosOcupados: vi.fn().mockResolvedValue([]),
  activarPorSlug: vi.fn().mockResolvedValue({ id: "n1" }),
  generarLinkPago: vi.fn(),
  setTheme: vi.fn(),
  toast: vi.fn(),
  navegarA: vi.fn(),
  clipboard: vi.fn(),
}

vi.mock("@/context/store", () => ({
  useStore: () => ({
    negocio: mocks.negocio,
    servicios: mocks.servicios,
    empleados: mocks.empleados,
    slotsHorario: mocks.slotsHorario,
    tomarCita: mocks.tomarCita,
    horariosOcupados: mocks.horariosOcupados,
    activarPorSlug: mocks.activarPorSlug,
    generarLinkPago: mocks.generarLinkPago,
    datosPago: mocks.datosPago,
  }),
}))
vi.mock("@/lib/theme", () => ({ useTheme: () => ({ setTheme: mocks.setTheme }) }))
vi.mock("@/lib/toast", () => ({ useToast: () => mocks.toast }))
vi.mock("@/lib/router", () => ({
  navegarA: (ruta) => mocks.navegarA(ruta),
  slugDe: () => "",
  leerRuta: () => ({ query: "" }),
  parametrosDe: () => ({}),
}))
vi.mock("@/components/public/Logo3D", () => ({ default: () => <span data-testid="logo3d" /> }))
vi.mock("@/components/Background", () => ({ default: () => null }))

import PublicReserva from "@/pages/PublicReserva"

beforeEach(() => {
  vi.clearAllMocks()
  mocks.datosPago = { efectivo: true, transferencia: false, mp: false, mpConfigurado: false }
  mocks.tomarCita.mockResolvedValue({ venta_id: "v1" })
  mocks.generarLinkPago.mockResolvedValue({ init_point: "https://mp.test/pay" })
  navigator.clipboard = { writeText: mocks.clipboard.mockResolvedValue(undefined) }
})

describe("PublicReserva", () => {
  it("activa la barbería por slug al montar", () => {
    render(<PublicReserva slug="el-cauce" />)
    expect(mocks.activarPorSlug).toHaveBeenCalledWith("el-cauce")
  })

  it("paso 1: permite elegir servicio y continuar", () => {
    render(<PublicReserva slug="el-cauce" />)
    expect(screen.getByRole("heading", { name: "Elige el servicio" })).toBeInTheDocument()
    expect(screen.getByText("Corte")).toBeInTheDocument()
    const continuar = screen.getByRole("button", { name: /Continuar/ })
    expect(continuar).toBeDisabled()
    fireEvent.click(screen.getByText("Corte"))
    expect(continuar).not.toBeDisabled()
    fireEvent.click(continuar)
    expect(screen.getByRole("heading", { name: "¿Con quién y cuándo?" })).toBeInTheDocument()
  })

  it("paso 2: pide elegir barbero y hora para continuar", async () => {
    render(<PublicReserva slug="el-cauce" />)
    fireEvent.click(screen.getByText("Corte"))
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }))
    const continuar = screen.getByRole("button", { name: /Continuar/ })
    expect(continuar).toBeDisabled()
    fireEvent.click(screen.getByText("Carlos"))
    expect(mocks.horariosOcupados).toHaveBeenCalledWith(hoy, "e1")
    await vi.waitFor(() => expect(screen.getByText("10:00")).toBeInTheDocument())
    fireEvent.click(screen.getByText("10:00"))
    expect(continuar).not.toBeDisabled()
    fireEvent.click(continuar)
    expect(screen.getByRole("heading", { name: "Tus datos" })).toBeInTheDocument()
  })

  it("oculta horas ocupadas", async () => {
    mocks.horariosOcupados.mockResolvedValue(["10:00", "11:30"])
    render(<PublicReserva slug="el-cauce" />)
    fireEvent.click(screen.getByText("Corte"))
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }))
    fireEvent.click(screen.getByText("Carlos"))
    await vi.waitFor(() => expect(screen.getByText("10:30")).toBeInTheDocument())
    await vi.waitFor(() => expect(screen.queryByText("10:00")).not.toBeInTheDocument())
    expect(screen.queryByText("11:30")).not.toBeInTheDocument()
  })

  it("paso 3: exige nombre y teléfono", () => {
    render(<PublicReserva slug="el-cauce" />)
    fireEvent.click(screen.getByText("Corte"))
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }))
    fireEvent.click(screen.getByText("Carlos"))
    fireEvent.click(screen.getByText("10:00"))
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }))
    const continuar = screen.getByRole("button", { name: /Continuar/ })
    expect(continuar).toBeDisabled()
    fireEvent.change(screen.getByPlaceholderText("Tu nombre"), { target: { value: "Ana" } })
    expect(continuar).toBeDisabled()
    fireEvent.change(screen.getByPlaceholderText("+569 1234 5678"), { target: { value: "+56912345678" } })
    expect(continuar).not.toBeDisabled()
  })

  it("confirma la cita en efectivo y navega a la barbería", async () => {
    render(<PublicReserva slug="el-cauce" />)
    fireEvent.click(screen.getByText("Corte"))
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }))
    fireEvent.click(screen.getByText("Carlos"))
    fireEvent.click(screen.getByText("10:00"))
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }))
    fireEvent.change(screen.getByPlaceholderText("Tu nombre"), { target: { value: "Ana" } })
    fireEvent.change(screen.getByPlaceholderText("+569 1234 5678"), { target: { value: "+56912345678" } })
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }))
    expect(screen.getByRole("heading", { name: "Confirma tu cita" })).toBeInTheDocument()
    expect(screen.getByText(`Total`)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Confirmar cita/ }))
    await vi.waitFor(() =>
      expect(mocks.tomarCita).toHaveBeenCalledWith({
        nombre: "Ana",
        telefono: "+56912345678",
        servicioId: "s1",
        fecha: hoy,
        hora: "10:00",
        empleadoId: "e1",
        metodoPago: null,
      })
    )
    expect(mocks.toast).toHaveBeenCalledWith("¡Cita confirmada! Te esperamos.")
    expect(mocks.navegarA).toHaveBeenCalledWith("/c/el-cauce")
  })

  it("con Mercado Pago genera link de pago y redirige", async () => {
    mocks.datosPago = { efectivo: false, transferencia: false, mp: true, mpConfigurado: true }
    render(<PublicReserva slug="el-cauce" />)
    fireEvent.click(screen.getByText("Corte"))
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }))
    fireEvent.click(screen.getByText("Carlos"))
    fireEvent.click(screen.getByText("10:00"))
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }))
    fireEvent.change(screen.getByPlaceholderText("Tu nombre"), { target: { value: "Ana" } })
    fireEvent.change(screen.getByPlaceholderText("+569 1234 5678"), { target: { value: "+56912345678" } })
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }))
    expect(screen.getByText("Mercado Pago")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Confirmar cita/ }))
    await vi.waitFor(() => expect(mocks.tomarCita).toHaveBeenCalled())
    expect(mocks.generarLinkPago).toHaveBeenCalledWith({
      negocioId: "n1",
      ventaId: "v1",
      monto: 12000,
      concepto: "Corte",
    })
  })

  it("muestra datos de transferencia del negocio y permite copiar", async () => {
    mocks.datosPago = { efectivo: false, transferencia: true, mp: false, mpConfigurado: false, transferenciaNegocio: { banco: "Banco Estado", tipoCuenta: "CuentaRut", numero: "1234", rut: "11.111.111-1", titular: "El Cauce" } }
    render(<PublicReserva slug="el-cauce" />)
    fireEvent.click(screen.getByText("Corte"))
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }))
    fireEvent.click(screen.getByText("Carlos"))
    fireEvent.click(screen.getByText("10:00"))
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }))
    fireEvent.change(screen.getByPlaceholderText("Tu nombre"), { target: { value: "Ana" } })
    fireEvent.change(screen.getByPlaceholderText("+569 1234 5678"), { target: { value: "+56912345678" } })
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }))
    expect(screen.getByText("Datos del negocio")).toBeInTheDocument()
    expect(screen.getByText("Banco Estado")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Copiar/ }))
    await vi.waitFor(() => expect(mocks.clipboard).toHaveBeenCalled())
    expect(mocks.toast).toHaveBeenCalledWith("Datos copiados al portapapeles")
  })
})
