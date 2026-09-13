import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import React from "react"

const mocks = {
  negocio: { id: "n1", slug: "el-cauce", nombre: "El Cauce", tema: "elegante" },
  servicios: [],
  empleados: [],
  galeria: [],
  error: null,
  activarPorSlug: vi.fn(),
  addQrScan: vi.fn(),
  setTheme: vi.fn(),
}

vi.mock("@/context/store", () => ({
  useStore: () => ({
    negocio: mocks.negocio,
    servicios: mocks.servicios,
    empleados: mocks.empleados,
    galeria: mocks.galeria,
    error: mocks.error,
    activarPorSlug: mocks.activarPorSlug,
    addQrScan: mocks.addQrScan,
  }),
}))
vi.mock("@/lib/theme", () => ({
  useTheme: () => ({ theme: "elegante", setTheme: mocks.setTheme }),
}))
vi.mock("@/components/public/Logo3D", () => ({ default: () => <div data-testid="logo3d" /> }))
vi.mock("@/components/Background", () => ({ default: () => <div data-testid="bg" /> }))

import PublicPage from "@/pages/PublicPage"

const setHash = (h) => {
  window.location.hash = h
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.activarPorSlug.mockResolvedValue()
  mocks.addQrScan.mockResolvedValue()
  mocks.negocio = { id: "n1", slug: "el-cauce", nombre: "El Cauce", tema: "elegante" }
})

describe("PublicPage · escaneo de QR", () => {
  it("registra un escaneo cuando se entra con qr=1", () => {
    setHash("#/c/el-cauce?tema=elegante&qr=1")
    render(<PublicPage slug="el-cauce" />)
    expect(mocks.activarPorSlug).toHaveBeenCalledWith("el-cauce")
    expect(mocks.addQrScan).toHaveBeenCalledTimes(1)
    expect(mocks.addQrScan).toHaveBeenCalledWith("qr")
    expect(screen.getByText("El Cauce")).toBeInTheDocument()
  })

  it("no registra escaneo si no viene de un QR", () => {
    setHash("#/c/el-cauce")
    render(<PublicPage slug="el-cauce" />)
    expect(mocks.addQrScan).not.toHaveBeenCalled()
  })

  it("registra el escaneo solo una vez por carga de página", () => {
    setHash("#/c/el-cauce?tema=elegante&qr=1")
    const { rerender } = render(<PublicPage slug="el-cauce" />)
    rerender(<PublicPage slug="el-cauce" />)
    expect(mocks.addQrScan).toHaveBeenCalledTimes(1)
  })
})