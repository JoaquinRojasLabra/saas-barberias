import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { filaAFront, frontAFila, mapaDe } from "@/lib/mapos"

const filaA = filaAFront

const StoreContext = createContext()

function leerHora (v) {
  if (!v) return ""
  return String(v).slice(0, 5)
}

export function StoreProvider({ children }) {
  const [session, setSession] = useState(null)          // { usuarioId, negocioId, rol, empleadoId }
  const [negocio, setNegocio] = useState(null)
  const [empleados, setEmpleados] = useState([])
  const [servicios, setServicios] = useState([])
  const [clientes, setClientes] = useState([])
  const [turnos, setTurnos] = useState([])
  const [ventas, setVentas] = useState([])
  const [qrStats, setQrStats] = useState([])
  const [preferencias, setPreferencias] = useState({ horasRecordatorio: 2, whatsappNumero: "" })
  const [slotsHorario, setSlotsHorario] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState("dashboard")

  const enCargandoRef = useRef(null)

  const setSesion = useCallback((s) => {
    setCargando(false)
    setSession(s)
  }, [])

  const limpiarEstado = useCallback(() => {
    setSesion(null)
    setNegocio(null)
    setEmpleados([])
    setServicios([])
    setClientes([])
    setTurnos([])
    setVentas([])
    setQrStats([])
    setPreferencias({ horasRecordatorio: 2, whatsappNumero: "" })
    setSlotsHorario([])
    setCargando(true)
    setError(null)
  }, [setSesion])

  const cargarTenant = useCallback(async (negocioId, conPref = true) => {
    setCargando(true); setError(null)
    try {
      const [emps, srvs, trns, vts, clts, slots, pref] = await Promise.all([
        supabase.from("empleados").select("*").eq("negocio_id", negocioId).order("created_at"),
        supabase.from("servicios").select("*").eq("negocio_id", negocioId).order("created_at"),
        supabase.from("turnos").select("*").eq("negocio_id", negocioId).order("fecha", { ascending: false }),
        supabase.from("ventas").select("*").eq("negocio_id", negocioId).order("fecha_hora", { ascending: false }),
        supabase.from("clientes").select("*").eq("negocio_id", negocioId).order("created_at"),
        supabase.from("slots_horario").select("*").eq("negocio_id", negocioId).order("hora"),
        conPref ? supabase.from("preferencias").select("*").eq("negocio_id", negocioId).maybeSingle() : Promise.resolve({ data: null, error: null }),
      ])
      const firstErr = [emps, srvs, trns, vts, clts, slots, pref].find((r) => r.error)
      if (firstErr) throw firstErr.error
      setEmpleados(mapaDe(emps.data))
      setServicios(mapaDe(srvs.data))
      setTurnos(mapaDe(trns.data))
      setVentas(mapaDe(vts.data))
      setClientes(mapaDe(clts.data))
      setSlotsHorario((slots.data || []).map((s) => leerHora(s.hora)))
      setPreferencias(pref?.data ? filaA(pref.data) : { horasRecordatorio: 2, whatsappNumero: negocio?.telefono || "" })
      setCargando(false)
    } catch (e) {
      setError(e?.message || "Error al cargar")
      setCargando(false)
    }
  }, [negocio?.telefono])

  const horariosOcupados = useCallback(async (fecha, empleadoId) => {
    if (!negocio?.id) return []
    const { data, error: err } = await supabase.rpc("horarios_ocupados", {
      p_negocio: negocio.id,
      p_fecha: fecha,
      p_empleado: empleadoId || null,
    })
    if (err) return []
    return data || []
  }, [negocio?.id])

  const cargarPerfil = useCallback(async (userId) => {
    if (enCargandoRef.current) return
    enCargandoRef.current = true
    try {
      const [negRes, empRes] = await Promise.all([
        supabase.from("negocios").select("*").eq("usuario_auth", userId).maybeSingle(),
        supabase.from("empleados").select("*").eq("usuario_auth", userId).maybeSingle(),
      ])
      if (negRes.data) {
        setNegocio(filaA(negRes.data))
        setSesion({ usuarioId: userId, rol: "dueno", negocioId: negRes.data.id, empleadoId: null, barberoId: null })
        await cargarTenant(negRes.data.id)
        return
      }
      if (empRes.data) {
        const { data: n } = await supabase.from("negocios").select("id, nombre") .eq("id", empRes.data.negocio_id).single()
        if (!n) { setSesion(null); return }
        setNegocio(filaA(n))
        setSesion({ usuarioId: userId, rol: "barbero", negocioId: n.id, empleadoId: empRes.data.id, barberoId: empRes.data.id })
        setView("agenda")
        await cargarTenant(n.id)
        return
      }
      setSesion(null)
    } catch (e) {
      setError(e?.message || "Error al cargar perfil")
      setCargando(false)
    } finally {
      enCargandoRef.current = false
    }
  }, [cargarTenant, setSesion])

  useEffect(() => {
    let activo = true
    supabase.auth.getSession().then(({ data }) => {
      if (!activo) return
      if (data.session?.user) lazyPerfil(data.session.user.id)
      else { setSesion(null); setCargando(false) }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((evento) => {
      if (!activo) return
      if (evento === "SIGNED_OUT") limpiarEstado()
      else if (evento === "SIGNED_IN" || evento === "TOKEN_REFRESHED" || evento === "INITIAL_SESSION") {
        supabase.auth.getUser().then(({ data }) => {
          if (activo && data.user) cargarPerfil(data.user.id)
        })
      }
    })
    const subscription = sub?.subscription
    return () => { activo = false; subscription?.unsubscribe() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const lazyPerfil = useCallback(async (userId) => {
    await cargarPerfil(userId)
  }, [cargarPerfil])

  const esBarbero = session?.rol === "barbero"

  const scope = useMemo(() => {
    const base = { turnos, clientes, ventas }
    if (!esBarbero) return { ...base, esPersonal: false }
    const id = session?.empleadoId
    return {
      esPersonal: true,
      turnos: turnos.filter((t) => t.empleadoId === id),
      clientes: clientes.filter((c) => c.empleadoId === id),
      ventas: ventas.filter((v) => v.empleadoId === id),
    }
  }, [esBarbero, session, turnos, clientes, ventas])

  const login = useCallback(async (email, pass) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) throw error
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const registrarNegocio = useCallback(async ({ nombre, telefono, email, password }) => {
    if (!email || !String(email).includes("@")) throw new Error("Se necesita un email válido para crear la cuenta")
    const slugBase = (nombre || "barberia").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "barberia"
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    })
    if (error) throw error
    const uid = data.user?.id
    if (!uid) throw new Error("No se pudo crear el usuario")
    const { error: e2 } = await supabase.from("negocios").insert({
      slug: `${slugBase}-${Date.now().toString(36)}`,
      nombre,
      telefono: telefono || "",
      usuario_auth: uid,
    })
    if (e2) throw e2
    await cargarPerfil(uid)
  }, [cargarPerfil])

  const activarPorSlug = useCallback(async (slug) => {
    setCargando(true); setError(null)
    try {
      const { data } = await supabase.from("negocios").select("*").eq("slug", slug).maybeSingle()
      if (!data) { setError("Barbería no encontrada"); setCargando(false); return null }
      const yaAutenticado = session?.rol && session.rol !== "anon"
      if (!yaAutenticado) setSesion({ usuarioId: null, rol: "anon", negocioId: data.id, empleadoId: null, barberoId: null })
      setNegocio(filaA(data))
      const [srvs, emps, slots] = await Promise.all([
        supabase.from("servicios").select("*").eq("negocio_id", data.id).order("created_at"),
        supabase.from("empleados").select("id, negocio_id, nombre").eq("negocio_id", data.id).order("created_at"),
        supabase.from("slots_horario").select("*").eq("negocio_id", data.id).order("hora"),
      ])
      setServicios(mapaDe(srvs.data))
      setEmpleados(mapaDe(emps.data))
      setSlotsHorario((slots.data || []).map((s) => leerHora(s.hora)))
      if (session?.rol === "dueno" || session?.rol === "barbero") {
        await cargarTenant(data.id)
      } else {
        setTurnos([]); setVentas([]); setClientes([]); setQrStats([])
        setPreferencias({ horasRecordatorio: 2, whatsappNumero: data?.telefono || "" })
        setCargando(false)
      }
      return data
    } catch (e) {
      setError(e?.message || "Error al cargar la barbería")
      setCargando(false)
      return null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.rol])

  const refrescar = useCallback(async (negocioId) => {
    if (!negocioId) return
    const [trns, vts] = await Promise.all([
      supabase.from("turnos").select("*").eq("negocio_id", negocioId).order("fecha", { ascending: false }),
      supabase.from("ventas").select("*").eq("negocio_id", negocioId).order("fecha_hora", { ascending: false }),
    ])
    if (!trns.error) setTurnos(mapaDe(trns.data))
    if (!vts.error) setVentas(mapaDe(vts.data))
  }, [])

  const tomarCita = useCallback(async ({ servicioId, fecha, hora, empleadoId, metodoPago, nombre, telefono }) => {
    const nid = negocio?.id
    if (!nid) throw new Error("Negocio no cargado")
    const pendiente = metodoPago === "En línea"
    const { data: rpc, error } = await supabase.rpc("reservar_turno", {
      p_negocio: nid,
      p_nombre: nombre,
      p_whatsapp: telefono || null,
      p_telefono: telefono || null,
      p_servicio: servicioId,
      p_empleado: empleadoId || null,
      p_fecha: fecha,
      p_hora: hora,
      p_pendiente: pendiente,
    })
    if (error) throw error
    await refrescar(nid)
    return rpc
  }, [negocio?.id, refrescar])

  const setTurnoEstado = useCallback(async (id, estado) => {
    const t = turnos.find((x) => x.id === id)
    if (!t) return
    const { error } = await supabase.from("turnos").update({ estado }).eq("id", id)
    if (error) throw error
    if (estado === "cumplido" && !t.pagado) {
      const svc = servicios.find((sv) => sv.id === t.servicioId) || { precio: 0 }
      const { error: e2 } = await supabase.from("ventas").insert({
        negocio_id: t.negocioId, cliente_id: t.clienteId, servicio_id: t.servicioId, turno_id: t.id,
        empleado_id: t.empleadoId, monto: svc.precio,
        fecha_hora: `${t.fecha}T${t.hora}:00`,
        metodo: t.metodoPago || "Efectivo", pagado: true, pendiente_pago: false,
      })
      if (e2) throw e2
    }
    await refrescar(t.negocioId)
  }, [turnos, servicios, refrescar])

  const addTurno = useCallback(async (turno) => {
    const nid = negocio?.id
    if (!nid) throw new Error("Negocio no cargado")
    const { error } = await supabase.from("turnos").insert({
      negocio_id: nid, cliente_id: turno.clienteId, servicio_id: turno.servicioId,
      empleado_id: turno.empleadoId || null, fecha: turno.fecha, hora: turno.hora,
      estado: turno.estado || "confirmado", origen: turno.origen || "panel",
    })
    if (error) throw error
    await refrescar(nid)
  }, [negocio?.id, refrescar])

  const addVenta = useCallback(async (venta) => {
    const nid = negocio?.id
    if (!nid) throw new Error("Negocio no cargado")
    const { data, error } = await supabase.from("ventas").insert({
      ...frontAFila("ventas", venta),
      negocio_id: nid,
      pagado: venta.pagado ?? true,
      pendiente_pago: false,
    }).select("*").single()
    if (error) throw error
    setVentas((prev) => [filaA(data), ...prev])
    return data
  }, [negocio?.id])

  const marcarPagadaVenta = useCallback(async (id) => {
    const venta = ventas.find((v) => v.id === id)
    if (!venta || venta.pagado) return
    const { error } = await supabase.from("ventas").update({ pagado: true, pendiente_pago: false }).eq("id", id)
    if (error) throw error
    setVentas((prev) => prev.map((v) => (v.id === id ? { ...v, pagado: true, pendientePago: false } : v)))
    if (venta.turnoId) {
      await supabase.from("turnos").update({ pagado: true }).eq("id", venta.turnoId)
      setTurnos((prev) => prev.map((t) => (t.id === venta.turnoId ? { ...t, pagado: true } : t)))
    }
  }, [ventas])

  const marcarPagadoTurno = useCallback(async (id) => {
    await supabase.from("turnos").update({ pagado: true }).eq("id", id)
    setTurnos((prev) => prev.map((t) => (t.id === id ? { ...t, pagado: true } : t)))
  }, [])

  const addQrScan = useCallback(async (fuente) => {
    const nid = negocio?.id
    if (!nid) return
    const { data, error } = await supabase.from("qr_stats").insert({
      negocio_id: nid, fuente, fecha_hora: new Date().toISOString(),
    }).select("*").single()
    if (!error && data) setQrStats((prev) => [filaA(data), ...prev])
  }, [negocio?.id])

  const updateNegocio = useCallback(async (patch) => {
    setNegocio((prev) => (prev ? { ...prev, ...patch } : prev))
    const nid = negocio?.id
    if (!nid || !session?.negocioId) return
    await supabase.from("negocios").update(frontAFila("negocios", patch)).eq("id", nid)
  }, [negocio?.id, session?.negocioId])

  const updatePreferencias = useCallback(async (patch) => {
    setPreferencias((prev) => ({ ...prev, ...patch }))
    const nid = negocio?.id
    if (!nid) return
    await supabase.from("preferencias").upsert({
      negocio_id: nid,
      horas_recordatorio: patch.horasRecordatorio ?? preferencias.horasRecordatorio,
      whatsapp_numero: patch.whatsappNumero ?? preferencias.whatsappNumero,
      updated_at: new Date().toISOString(),
    })
  }, [negocio?.id, preferencias])

  const updateSlotsHorario = useCallback(async (slots) => {
    const nid = negocio?.id
    if (!nid) return
    setSlotsHorario(slots)
    await supabase.from("slots_horario").delete().eq("negocio_id", nid)
    if (slots.length) {
      await supabase.from("slots_horario").insert(slots.map((h) => ({ negocio_id: nid, hora: h })))
    }
  }, [negocio?.id])

  const addCliente = useCallback(async (cliente) => {
    const nid = negocio?.id
    const c = { id: `c-${Date.now()}`, visitas: 0, ...cliente }
    if (nid) {
      const { data, error } = await supabase.from("clientes").insert({
        negocio_id: nid, nombre: cliente.nombre, whatsapp: cliente.whatsapp, telefono: cliente.telefono,
        notas: cliente.notas, visitas: 0, empleado_id: cliente.empleadoId || null,
      }).select("*").single()
      if (!error && data) return filaA(data)
    }
    setClientes((prev) => [c, ...prev])
    return c
  }, [negocio?.id])

  const updateCliente = useCallback(async (id, patch) => {
    setClientes((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    await supabase.from("clientes").update(frontAFila("clientes", patch)).eq("id", id)
  }, [])

  const addServicio = useCallback(async (servicio) => {
    const nid = negocio?.id
    if (!nid) return
    const { data, error } = await supabase.from("servicios").insert({
      negocio_id: nid, nombre: servicio.nombre, duracion: servicio.duracion, precio: servicio.precio,
    }).select("*").single()
    if (error) throw error
    setServicios((prev) => [...prev, filaA(data)])
    return data
  }, [negocio?.id])

  const updateServicio = useCallback(async (id, patch) => {
    setServicios((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
    await supabase.from("servicios").update(frontAFila("servicios", patch)).eq("id", id)
  }, [])

  const removeServicio = useCallback(async (id) => {
    setServicios((prev) => prev.filter((s) => s.id !== id))
    await supabase.from("servicios").delete().eq("id", id)
  }, [])

  const addEmpleado = useCallback(async (nombre, email) => {
    const nid = negocio?.id
    if (!nid) return null
    const payload = { negocio_id: nid, nombre, activado: true }
    if (email) {
      const { data: nu, error: eu } = await supabase.auth.signUp({
        email,
        password: "barberia123",
        options: { data: { nombre } },
      })
      if (eu) throw new Error((eu?.message || "No se pudo crear la cuenta del barbero").replace(/\.$/, ""))
      payload.usuario_auth = nu?.user?.id || null
    }
    const { data, error } = await supabase.from("empleados").insert(payload).select("*").single()
    if (error) throw error
    setEmpleados((prev) => [...prev, filaA(data)])
    return filaA(data)
  }, [negocio?.id])

  const updateEmpleado = useCallback(async (id, patch) => {
    setEmpleados((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch, activado: patch.activado ?? e.activado } : e)))
    await supabase.from("empleados").update(frontAFila("empleados", patch)).eq("id", id)
  }, [])

  const addUsuario = useCallback(async (u) => u, [])
  const updateUsuario = useCallback(async () => {}, [])
  const resetearClave = useCallback(() => "Pide a tu barbero usar «Olvidé mi contraseña» en el login", [])

  const generarLinkPago = useCallback((monto, concepto) => {
    const ref = `MP-${Date.now()}`
    return { ref, url: `https://mp.la/${ref}`, monto, concepto }
  }, [])

  const negocioId = session?.negocioId || negocio?.id || null

  const value = {
    negocio,
    sesion: session,
    session,
    view,
    setView,
    cargando,
    error,
    negocioId,
    esBarbero,
    scope,
    servicios,
    empleados,
    clientes,
    turnos,
    ventas,
    qrStats,
    preferencias,
    slotsHorario,
    login,
    logout,
    activarPorSlug,
    registrarNegocio,
    updateNegocio,
    updatePreferencias,
    updateSlotsHorario,
    addVenta,
    addTurno,
    setTurnoEstado,
    marcarPagadoTurno,
    addQrScan,
    marcarPagadaVenta,
    tomarCita,
    generarLinkPago,
    addCliente,
    updateCliente,
    addServicio,
    updateServicio,
    removeServicio,
    addEmpleado,
    updateEmpleado,
    addUsuario,
    updateUsuario,
    resetearClave,
    horariosOcupados,
    cargarTenant,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within a StoreProvider")
  return ctx
}