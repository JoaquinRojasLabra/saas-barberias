import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, waitFor, act } from "@testing-library/react"
import React, { useEffect } from "react"

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
    functions: { invoke: vi.fn() },
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
  supabasePublic: {
    rpc: vi.fn(),
  },
}))

import { supabase, supabasePublic } from "@/lib/supabase"
import { StoreProvider, useStore } from "@/context/store"

// Datos por tabla, en formato DB (snake_case).
const DB = {}

// Registra filtros de la cadena: [campo, valor] aplicados en orden.
function builder(table) {
  const filtros = []
  const base = () => {
    let rows = DB[table] || []
    for (const [campo, valor] of filtros) rows = rows.filter((r) => r[campo] === valor)
    return rows
  }
  const resuelve = {
    maybeSingle: () => Promise.resolve({ data: base()[0] ?? null, error: null }),
    single: () => Promise.resolve({ data: base()[0] ?? null, error: null }),
    order: () => Promise.resolve({ data: base(), error: null }),
  }
  return {
    select: vi.fn(() => ({
      eq: vi.fn((campo, valor) => { filtros.push([campo, valor]); return resuelve }),
      maybeSingle: resuelve.maybeSingle,
      single: resuelve.single,
      order: resuelve.order,
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: base()[0] ?? null, error: null })) })),
    })),
    update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
    delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
    upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    eq: vi.fn((campo, valor) => { filtros.push([campo, valor]); return resuelve }),
    order: resuelve.order,
  }
}

function setDB(objeto) {
  Object.keys(DB).forEach((k) => delete DB[k])
  Object.assign(DB, objeto)
}

function Harness({ onStore }) {
  const store = useStore()
  useEffect(() => { onStore?.(store) }, [store])
  return null
}

function renderStore(onStore) {
  return render(
    <StoreProvider>
      <Harness onStore={onStore} />
    </StoreProvider>
  )
}

function renderComoSesion(userId, onStore) {
  supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: userId } } } })
  return renderStore(onStore)
}

beforeEach(() => {
  vi.clearAllMocks()
  setDB({})
  supabase.from.mockImplementation(builder)
  supabase.rpc.mockImplementation((fn) => {
    if (fn === "datos_pago") return Promise.resolve({ data: { efectivo: true, transferencia: false, mp: false, mpConfigurado: false, transferenciaNegocio: null, barberos: [] }, error: null })
    return Promise.resolve({ data: null, error: null })
  })
  supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
  supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
  supabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
})

describe("store", () => {
  it("arranca sin sesión y sin cargar", async () => {
    let st
    renderStore((s) => { st = s })
    await waitFor(() => expect(st.cargando).toBe(false))
    expect(st.session).toBeNull()
    expect(st.esBarbero).toBe(false)
  })

  describe("login/logout", () => {
    it("login reenvía credenciales a supabase y propaga errores", async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({ error: null })
      let st
      renderStore((s) => { st = s })
      await waitFor(() => expect(st.cargando).toBe(false))
      await act(async () => { await st.login("a@b.cl", "123456") })
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: "a@b.cl", password: "123456" })

      supabase.auth.signInWithPassword.mockResolvedValue({ error: new Error("credenciales inválidas") })
      await expect(st.login("a@b.cl", "mal")).rejects.toThrow("credenciales inválidas")
    })

    it("logout llama a signOut", async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null })
      let st
      renderStore((s) => { st = s })
      await waitFor(() => expect(st.cargando).toBe(false))
      await act(async () => { await st.logout() })
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })
  })

  describe("cargarPerfil como dueño", () => {
    it("setea sesión dueño y carga el negocio", async () => {
      setDB({ negocios: [{ id: "n1", usuario_auth: "u1", nombre: "El Cauce", telefono: "123" }] })
      let st
      renderComoSesion("u1", (s) => { st = s })
      await waitFor(() => expect(st.session?.rol).toBe("dueno"))
      expect(st.negocio?.nombre).toBe("El Cauce")
    })
  })

  describe("cargarPerfil como barbero", () => {
    it("setea sesión barbero y vista agenda", async () => {
      setDB({
        empleados: [{ id: "e1", usuario_auth: "u2", negocio_id: "n1", nombre: "Juan" }],
        negocios: [{ id: "n1", nombre: "El Cauce", telefono: "123" }],
      })
      let st
      renderComoSesion("u2", (s) => { st = s })
      await waitFor(() => expect(st.session?.rol).toBe("barbero"))
      expect(st.session?.empleadoId).toBe("e1")
      expect(st.view).toBe("agenda")
      expect(st.esBarbero).toBe(true)
    })
  })

  describe("scope de barbero", () => {
    it("filtra turnos, clientes y ventas por empleado", async () => {
      setDB({
        empleados: [{ id: "e1", usuario_auth: "u3", negocio_id: "n1", nombre: "Juan" }],
        negocios: [{ id: "n1", nombre: "El Cauce", telefono: "123" }],
        turnos: [
          { id: "t1", negocio_id: "n1", empleado_id: "e1", fecha: "2026-08-11", hora: "10:00", estado: "confirmado" },
          { id: "t2", negocio_id: "n1", empleado_id: "e2", fecha: "2026-08-11", hora: "11:00", estado: "confirmado" },
        ],
        ventas: [
          { id: "v1", negocio_id: "n1", empleado_id: "e1", monto: 1000 },
          { id: "v2", negocio_id: "n1", empleado_id: "e2", monto: 2000 },
        ],
        clientes: [
          { id: "c1", negocio_id: "n1", empleado_id: "e1", nombre: "Ana" },
          { id: "c2", negocio_id: "n1", empleado_id: "e2", nombre: "Beto" },
        ],
      })
      let st
      renderComoSesion("u3", (s) => { st = s })
      await waitFor(() => expect(st.session?.rol).toBe("barbero"))
      await waitFor(() => expect(st.scope.turnos.length).toBe(1))
      expect(st.scope.turnos[0].id).toBe("t1")
      expect(st.scope.ventas[0].id).toBe("v1")
      expect(st.scope.clientes[0].id).toBe("c1")
      expect(st.scope.esPersonal).toBe(true)
    })
  })

  describe("guardarCredencialesMp", () => {
    it("llama al RPC y recarga datos de pago", async () => {
      setDB({ negocios: [{ id: "n1", usuario_auth: "u1", nombre: "El Cauce" }] })
      let st
      renderComoSesion("u1", (s) => { st = s })
      await waitFor(() => expect(st.negocio?.id).toBe("n1"))
      await act(async () => {
        await st.guardarCredencialesMp({ negocioId: "n1", publicKey: "APP_USR-1", accessToken: "TOKEN" })
      })
      expect(supabase.rpc).toHaveBeenCalledWith("guardar_credenciales_mp", {
        p_public_key: "APP_USR-1",
        p_access_token: "TOKEN",
      })
    })

    it("propaga error del RPC", async () => {
      supabase.rpc.mockImplementation((fn) => {
        if (fn === "guardar_credenciales_mp") return Promise.resolve({ data: null, error: { message: "denegado" } })
        return Promise.resolve({ data: null, error: null })
      })
      setDB({ negocios: [{ id: "n1", usuario_auth: "u1", nombre: "El Cauce" }] })
      let st
      renderComoSesion("u1", (s) => { st = s })
      await waitFor(() => expect(st.negocio?.id).toBe("n1"))
      await expect(st.guardarCredencialesMp({ negocioId: "n1", publicKey: "K", accessToken: "T" })).rejects.toThrow("denegado")
    })
  })

  describe("setTurnoEstado", () => {
    it("crea la venta con fecha_hora válido aunque la hora venga con segundos", async () => {
      const inserts = []
      const updatesTurnos = []
      supabase.from.mockImplementation((tabla) => {
        const b = builder(tabla)
        if (tabla === "ventas") {
          const orig = b.insert
          b.insert = vi.fn((payload) => { inserts.push(payload); return orig(payload) })
        }
        if (tabla === "turnos") {
          const orig = b.update
          b.update = vi.fn((payload) => { updatesTurnos.push(payload); return orig(payload) })
        }
        return b
      })
      setDB({
        negocios: [{ id: "n1", usuario_auth: "u1", nombre: "El Cauce" }],
        servicios: [{ id: "s1", negocio_id: "n1", nombre: "Corte", precio: 8000 }],
        turnos: [
          { id: "t1", negocio_id: "n1", cliente_id: "c1", servicio_id: "s1", empleado_id: "e1", fecha: "2026-08-11", hora: "10:00:00", estado: "confirmado", metodo_pago: "Efectivo", pagado: false },
        ],
      })
      let st
      renderComoSesion("u1", (s) => { st = s })
      await waitFor(() => expect(st.negocio?.id).toBe("n1"))
      await act(async () => {
        await st.setTurnoEstado("t1", "cumplido")
      })
      expect(inserts[0]).toMatchObject({
        turno_id: "t1",
        monto: 8000,
        fecha_hora: "2026-08-11T10:00:00",
      })
      expect(updatesTurnos[0]).toEqual({ estado: "cumplido", pagado: true })
    })

    it("acepta hora sin segundos", async () => {
      const inserts = []
      supabase.from.mockImplementation((tabla) => {
        const b = builder(tabla)
        if (tabla === "ventas") {
          const orig = b.insert
          b.insert = vi.fn((payload) => { inserts.push(payload); return orig(payload) })
        }
        return b
      })
      setDB({
        negocios: [{ id: "n1", usuario_auth: "u1", nombre: "El Cauce" }],
        servicios: [{ id: "s1", negocio_id: "n1", nombre: "Corte", precio: 8000 }],
        turnos: [
          { id: "t1", negocio_id: "n1", cliente_id: "c1", servicio_id: "s1", empleado_id: "e1", fecha: "2026-08-11", hora: "10:00", estado: "confirmado", metodo_pago: "Efectivo", pagado: false },
        ],
      })
      let st
      renderComoSesion("u1", (s) => { st = s })
      await waitFor(() => expect(st.negocio?.id).toBe("n1"))
      await act(async () => {
        await st.setTurnoEstado("t1", "cumplido")
      })
      expect(inserts[0]).toMatchObject({ fecha_hora: "2026-08-11T10:00:00" })
    })

    it("no crea venta si el turno ya está pagado", async () => {
      let insertLlama = false
      const updatesTurnos = []
      supabase.from.mockImplementation((tabla) => {
        const b = builder(tabla)
        if (tabla === "ventas") {
          const orig = b.insert
          b.insert = vi.fn((payload) => { insertLlama = true; return orig(payload) })
        }
        if (tabla === "turnos") {
          const orig = b.update
          b.update = vi.fn((payload) => { updatesTurnos.push(payload); return orig(payload) })
        }
        return b
      })
      setDB({
        negocios: [{ id: "n1", usuario_auth: "u1", nombre: "El Cauce" }],
        servicios: [{ id: "s1", negocio_id: "n1", nombre: "Corte", precio: 8000 }],
        turnos: [
          { id: "t1", negocio_id: "n1", cliente_id: "c1", servicio_id: "s1", empleado_id: "e1", fecha: "2026-08-11", hora: "10:00", estado: "confirmado", metodo_pago: "Efectivo", pagado: true },
        ],
      })
      let st
      renderComoSesion("u1", (s) => { st = s })
      await waitFor(() => expect(st.negocio?.id).toBe("n1"))
      await act(async () => {
        await st.setTurnoEstado("t1", "cumplido")
      })
      expect(insertLlama).toBe(false)
      expect(updatesTurnos[0]).toEqual({ estado: "cumplido", pagado: true })
    })
  })

  describe("addVenta", () => {
    it("inserta venta y la antepone al estado", async () => {
      setDB({ negocios: [{ id: "n1", usuario_auth: "u1", nombre: "El Cauce" }] })
      let st
      renderComoSesion("u1", (s) => { st = s })
      await waitFor(() => expect(st.negocio?.id).toBe("n1"))
      setDB({ ventas: [{ id: "v9", negocio_id: "n1", monto: 5000, metodo: "Efectivo" }] })
      await act(async () => {
        await st.addVenta({ clienteId: "c1", servicioId: "s1", monto: 5000, fechaHora: "2026-08-11T10:30", empleadoId: "e1", metodo: "Efectivo" })
      })
      expect(st.ventas[0]?.id).toBe("v9")
    })

    it("marca Mercado Pago como pendiente de pago", async () => {
      setDB({ negocios: [{ id: "n1", usuario_auth: "u1", nombre: "El Cauce" }] })
      let st
      renderComoSesion("u1", (s) => { st = s })
      await waitFor(() => expect(st.negocio?.id).toBe("n1"))
      setDB({ ventas: [{ id: "v10", negocio_id: "n1", monto: 5000, metodo: "Mercado Pago", pendiente_pago: true }] })
      const insertado = await act(async () =>
        st.addVenta({ clienteId: "c1", servicioId: "s1", monto: 5000, fechaHora: "2026-08-11T10:30", empleadoId: "e1", metodo: "Mercado Pago" })
      )
      expect(supabase.from).toHaveBeenCalledWith("ventas")
      expect(insertado.pendiente_pago).toBe(true)
    })
  })

  describe("tomarCita", () => {
    it("exige negocio cargado", async () => {
      let st
      renderStore((s) => { st = s })
      await waitFor(() => expect(st.cargando).toBe(false))
      await expect(st.tomarCita({})).rejects.toThrow("Negocio no cargado")
    })

    it("llama al RPC público reservar_turno", async () => {
      setDB({ negocios: [{ id: "n1", usuario_auth: "u1", nombre: "El Cauce" }] })
      let st
      renderComoSesion("u1", (s) => { st = s })
      await waitFor(() => expect(st.negocio?.id).toBe("n1"))
      supabasePublic.rpc.mockResolvedValue({ data: { ok: true }, error: null })
      await act(async () => {
        await st.tomarCita({ servicioId: "s1", fecha: "2026-08-11", hora: "10:00", nombre: "Ana" })
      })
      expect(supabasePublic.rpc).toHaveBeenCalledWith("reservar_turno", expect.objectContaining({ p_negocio: "n1" }))
    })
  })
})
