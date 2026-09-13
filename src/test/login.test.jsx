import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import React from "react"

const mocks = {
  login: vi.fn(),
  registrarNegocio: vi.fn(),
  recuperarClave: vi.fn(),
  actualizarClave: vi.fn(),
  finRecuperacion: vi.fn(),
  toast: vi.fn(),
  recuperando: false,
}

vi.mock("@/lib/auth", () => ({ useAuth: () => ({ login: mocks.login }) }))
vi.mock("@/lib/toast", () => ({ useToast: () => mocks.toast }))
vi.mock("@/context/store", () => ({
  useStore: () => ({
    registrarNegocio: mocks.registrarNegocio,
    recuperarClave: mocks.recuperarClave,
    actualizarClave: mocks.actualizarClave,
    finRecuperacion: mocks.finRecuperacion,
    recuperando: mocks.recuperando,
  }),
}))

import Login from "@/components/Login"

beforeEach(() => {
  vi.clearAllMocks()
  mocks.login.mockResolvedValue(undefined)
  mocks.recuperarClave.mockResolvedValue(undefined)
  mocks.actualizarClave.mockResolvedValue(undefined)
  mocks.finRecuperacion.mockResolvedValue(undefined)
  mocks.registrarNegocio.mockResolvedValue({ sesion: true })
})

describe("Login", () => {
  it("muestra el título de iniciar sesión por defecto", () => {
    render(<Login />)
    expect(screen.getByRole("heading", { name: "Inicia sesión" })).toBeInTheDocument()
  })

  it("llama a login con email y contraseña al enviar", async () => {
    render(<Login />)
    fireEvent.change(screen.getByPlaceholderText("tu@barberia.com"), { target: { value: "a@b.cl" } })
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "123456" } })
    fireEvent.click(screen.getByRole("button", { name: /Entrar al panel/ }))
    await waitFor(() => expect(mocks.login).toHaveBeenCalledWith("a@b.cl", "123456"))
  })

  it("muestra el error del login si falla", async () => {
    mocks.login.mockRejectedValue(new Error("credenciales inválidas"))
    render(<Login />)
    fireEvent.change(screen.getByPlaceholderText("tu@barberia.com"), { target: { value: "a@b.cl" } })
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "123456" } })
    fireEvent.click(screen.getByRole("button", { name: /Entrar al panel/ }))
    expect(await screen.findByText("credenciales inválidas")).toBeInTheDocument()
  })

  it("cambia al modo crear cuenta", () => {
    render(<Login />)
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }))
    expect(screen.getByRole("heading", { name: "Crea tu barbería" })).toBeInTheDocument()
  })

  it("deshabilita crear barbería con campos vacíos", () => {
    render(<Login />)
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }))
    const boton = screen.getByRole("button", { name: "Crear barbería" })
    expect(boton).toBeDisabled()
  })

  it("registra el negocio con los datos del formulario", async () => {
    render(<Login />)
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }))
    fireEvent.change(screen.getByPlaceholderText("Barbería El Cauce"), { target: { value: "El Cauce" } })
    fireEvent.change(screen.getByPlaceholderText("+56911112222"), { target: { value: "+56911112222" } })
    fireEvent.change(screen.getByPlaceholderText("tu@barberia.com"), { target: { value: "dueno@cauce.cl" } })
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "123456" } })
    fireEvent.click(screen.getByRole("button", { name: "Crear barbería" }))
    await waitFor(() =>
      expect(mocks.registrarNegocio).toHaveBeenCalledWith({
        nombre: "El Cauce",
        telefono: "+56911112222",
        email: "dueno@cauce.cl",
        password: "123456",
      })
    )
  })

  it("muestra aviso si la cuenta requiere confirmación por email", async () => {
    mocks.registrarNegocio.mockResolvedValue({ sesion: false })
    render(<Login />)
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }))
    fireEvent.change(screen.getByPlaceholderText("Barbería El Cauce"), { target: { value: "El Cauce" } })
    fireEvent.change(screen.getByPlaceholderText("tu@barberia.com"), { target: { value: "dueno@cauce.cl" } })
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "123456" } })
    fireEvent.click(screen.getByRole("button", { name: "Crear barbería" }))
    expect(await screen.findByText(/actívalo y luego inicia sesión/)).toBeInTheDocument()
  })

  it("valida email en recuperar contraseña", async () => {
    render(<Login />)
    fireEvent.click(screen.getByRole("button", { name: "¿Olvidaste tu contraseña?" }))
    fireEvent.click(screen.getByRole("button", { name: "Enviar enlace" }))
    expect(await screen.findByText("Ingresa tu email para recuperar la contraseña.")).toBeInTheDocument()
  })

  it("envía el enlace de recuperación con el email", async () => {
    render(<Login />)
    fireEvent.click(screen.getByRole("button", { name: "¿Olvidaste tu contraseña?" }))
    fireEvent.change(screen.getByPlaceholderText("tu@barberia.com"), { target: { value: "a@b.cl" } })
    fireEvent.click(screen.getByRole("button", { name: "Enviar enlace" }))
    await waitFor(() => expect(mocks.recuperarClave).toHaveBeenCalledWith("a@b.cl"))
    expect(await screen.findByText(/Revisa tu correo/)).toBeInTheDocument()
  })

  it("valida que las contraseñas nuevas coincidan y tengan 6+ caracteres", async () => {
    mocks.recuperando = true
    render(<Login />)
    expect(screen.getByRole("heading", { name: "Nueva contraseña" })).toBeInTheDocument()
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[0], { target: { value: "123456" } })
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[1], { target: { value: "654321" } })
    fireEvent.click(screen.getByRole("button", { name: "Cambiar contraseña" }))
    expect(await screen.findByText("Las contraseñas no coinciden.")).toBeInTheDocument()
    expect(mocks.actualizarClave).not.toHaveBeenCalled()
  })

  it("actualiza la clave y finaliza la recuperación si coincide", async () => {
    mocks.recuperando = true
    render(<Login />)
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[0], { target: { value: "123456" } })
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[1], { target: { value: "123456" } })
    fireEvent.click(screen.getByRole("button", { name: "Cambiar contraseña" }))
    await waitFor(() => expect(mocks.actualizarClave).toHaveBeenCalledWith("123456"))
    await waitFor(() => expect(mocks.finRecuperacion).toHaveBeenCalled())
  })
})
