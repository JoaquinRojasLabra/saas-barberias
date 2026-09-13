import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"
import { Users } from "@phosphor-icons/react"
import Cargando from "@/components/common/Cargando"
import EstadoError from "@/components/common/EstadoError"
import EstadoVacio from "@/components/common/EstadoVacio"
import useEstadoVista from "@/components/common/useEstadoVista.jsx"

function Probe({ estado }) {
  const node = useEstadoVista(estado)
  return <div>{node}</div>
}

describe("Cargando", () => {
  it("muestra el spinner, mensaje por defecto y role=status", () => {
    render(<Cargando />)
    expect(screen.getByText("Cargando…")).toBeInTheDocument()
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("usa el mensaje custom", () => {
    render(<Cargando mensaje="Cargando la barbería…" />)
    expect(screen.getByText("Cargando la barbería…")).toBeInTheDocument()
  })
})

describe("EstadoError", () => {
  it("muestra título + mensaje y dispara Reintentar", () => {
    const onReintentar = vi.fn()
    render(<EstadoError mensaje="Barbería no encontrada" onReintentar={onReintentar} />)
    expect(screen.getByText("Algo salió mal")).toBeInTheDocument()
    expect(screen.getByText("Barbería no encontrada")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }))
    expect(onReintentar).toHaveBeenCalledTimes(1)
  })

  it("no muestra botón si no hay onReintentar", () => {
    render(<EstadoError mensaje="ups" />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })
})

describe("EstadoVacio", () => {
  it("muestra icono, título, descripción y ejecuta el CTA", () => {
    const onCta = vi.fn()
    render(
      <EstadoVacio
        icono={Users}
        titulo="Sin turnos para hoy"
        descripcion="Empieza el día agendando tu primer turno"
        cta="Nuevo turno"
        onCta={onCta}
      />
    )
    expect(screen.getByText("Sin turnos para hoy")).toBeInTheDocument()
    expect(screen.getByText("Empieza el día agendando tu primer turno")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Nuevo turno/i }))
    expect(onCta).toHaveBeenCalledTimes(1)
  })

  it("no muestra botón si no hay cta", () => {
    render(<EstadoVacio icono={Users} titulo="Sin resultados" />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })
})

describe("useEstadoVista", () => {
  it("prioriza cargando > error > vacío > null", () => {
    const { rerender } = render(
      <Probe estado={{ cargando: true, error: "Algo falló", vacio: true }} />
    )
    expect(screen.getByText("Cargando…")).toBeInTheDocument()

    rerender(
      <Probe estado={{ cargando: false, error: "Algo falló", vacio: true, onReintentar: vi.fn() }} />
    )
    expect(screen.getByText("Algo salió mal")).toBeInTheDocument()

    rerender(
      <Probe estado={{ cargando: false, error: null, vacio: true, icono: Users, titulo: "Vacío" }} />
    )
    expect(screen.getByText("Vacío")).toBeInTheDocument()

    rerender(<Probe estado={{ cargando: false, error: null, vacio: false }} />)
    expect(screen.queryByText("Cargando…")).not.toBeInTheDocument()
    expect(screen.queryByText("Vacío")).not.toBeInTheDocument()
  })
})