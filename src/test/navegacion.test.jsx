import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"

const mocks = {
  view: "agenda",
  setView: vi.fn(),
  negocio: { nombre: "El Cauce", direccion: "Av. Siempre Viva 123", slug: "el-cauce" },
  esBarbero: false,
  session: { usuarioId: "u1" },
  logout: vi.fn(),
  navegarA: vi.fn(),
}

vi.mock("@/context/store", () => ({
  useStore: () => ({
    view: mocks.view,
    setView: mocks.setView,
    negocio: mocks.negocio,
    esBarbero: mocks.esBarbero,
    session: mocks.session,
  }),
}))
vi.mock("@/lib/auth", () => ({ useAuth: () => ({ logout: mocks.logout }) }))
vi.mock("@/lib/router", () => ({ navegarA: (ruta) => mocks.navegarA(ruta) }))

import Sidebar from "@/components/Sidebar"
import BottomNav from "@/components/BottomNav"

beforeEach(() => {
  vi.clearAllMocks()
  mocks.view = "agenda"
  mocks.esBarbero = false
})

describe("Sidebar", () => {
  it("muestra el nombre y dirección del negocio", () => {
    render(<Sidebar />)
    expect(screen.getByText("El Cauce")).toBeInTheDocument()
    expect(screen.getByText("Av. Siempre Viva 123")).toBeInTheDocument()
  })

  it("dueño ve todos los ítems", () => {
    render(<Sidebar />)
    for (const label of ["Dashboard", "Agenda", "Clientes", "Ventas", "Mi QR", "Personalización", "Ajustes"]) {
      expect(screen.getByRole("button", { name: new RegExp(label) })).toBeInTheDocument()
    }
  })

  it("barbero no ve Dashboard, Mi QR ni Personalización", () => {
    mocks.esBarbero = true
    render(<Sidebar />)
    expect(screen.queryByRole("button", { name: /Dashboard/ })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Mi QR/ })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Personalización/ })).not.toBeInTheDocument()
    for (const label of ["Agenda", "Clientes", "Ventas", "Ajustes"]) {
      expect(screen.getByRole("button", { name: new RegExp(label) })).toBeInTheDocument()
    }
  })

  it("marca el ítem activo según view", () => {
    mocks.view = "ventas"
    render(<Sidebar />)
    const boton = screen.getByRole("button", { name: /Ventas/ })
    expect(boton.className).toContain("text-white")
    expect(screen.getByRole("button", { name: /Agenda/ }).className).not.toContain("text-white")
  })

  it("cambia de vista al hacer clic", () => {
    render(<Sidebar />)
    fireEvent.click(screen.getByRole("button", { name: /Clientes/ }))
    expect(mocks.setView).toHaveBeenCalledWith("clientes")
  })

  it("solo el dueño ve 'Ver página pública' y navega al slug", () => {
    render(<Sidebar />)
    fireEvent.click(screen.getByRole("button", { name: /Ver página pública/ }))
    expect(mocks.navegarA).toHaveBeenCalledWith("/c/el-cauce")
  })

  it("el barbero no ve 'Ver página pública'", () => {
    mocks.esBarbero = true
    render(<Sidebar />)
    expect(screen.queryByRole("button", { name: /Ver página pública/ })).not.toBeInTheDocument()
  })

  it("muestra 'Dueño' y nombre del negocio para el dueño", () => {
    render(<Sidebar />)
    expect(screen.getByText("Dueño")).toBeInTheDocument()
    expect(screen.getByText("Dueño · El Cauce")).toBeInTheDocument()
  })

  it("muestra 'Barbero' para el barbero", () => {
    mocks.esBarbero = true
    render(<Sidebar />)
    expect(screen.getByText("Perfil de barbero")).toBeInTheDocument()
    expect(screen.getByText("Barbero", { selector: "p" }).textContent).toBe("Barbero")
  })

  it("cierra sesión al hacer clic en Cerrar sesión", () => {
    render(<Sidebar />)
    fireEvent.click(screen.getByRole("button", { name: /Cerrar sesión/ }))
    expect(mocks.logout).toHaveBeenCalled()
  })
})

describe("BottomNav", () => {
  it("dueño ve Inicio, Agenda, Ventas, Clientes, QR y Más", () => {
    render(<BottomNav />)
    for (const label of ["Inicio", "Agenda", "Ventas", "Clientes", "QR", "Más"]) {
      expect(screen.getByRole("button", { name: new RegExp(label) })).toBeInTheDocument()
    }
  })

  it("barbero no ve Inicio", () => {
    mocks.esBarbero = true
    render(<BottomNav />)
    expect(screen.queryByRole("button", { name: /Inicio/ })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Agenda/ })).toBeInTheDocument()
  })

  it("marca el activo según view", () => {
    mocks.view = "ventas"
    render(<BottomNav />)
    expect(screen.getByRole("button", { name: /Ventas/ }).className).toContain("text-[var(--accent)]")
    expect(screen.getByRole("button", { name: /Agenda/ }).className).not.toContain("text-[var(--accent)]")
  })

  it("cambia de vista al hacer clic", () => {
    render(<BottomNav />)
    fireEvent.click(screen.getByRole("button", { name: /Clientes/ }))
    expect(mocks.setView).toHaveBeenCalledWith("clientes")
  })
})
