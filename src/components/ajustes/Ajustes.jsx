import { useState, useRef } from "react"
import { Plus, Trash, PencilSimple, Check, X, Storefront, Palette, Scissors, Key, ChatTeardrop, ArrowRight, Power, Users, UserPlus, UserCircle, Bank, CurrencyDollar, CreditCard, WhatsappLogo } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import useEstadoVista from "@/components/common/useEstadoVista"
import EstadoVacio from "@/components/common/EstadoVacio"
import { useTheme } from "@/lib/theme"
import { useToast } from "@/lib/toast"
import { supabase } from "@/lib/supabase"

export default function Ajustes() {
  const { negocio, servicios, empleados, session, updateNegocio, updatePreferencias, preferencias, addServicio, updateServicio, removeServicio, esBarbero, updateEmpleado, guardarCredencialesMp, guardarCredencialesWa, datosPago, setView } = useStore()
  const { theme, setTheme, THEMES } = useTheme()
  const push = useToast()

  const [identidad, setIdentidad] = useState({
    nombre: negocio?.nombre || "",
    direccion: negocio?.direccion || "",
    telefono: negocio?.telefono || "",
  })

  const [notif, setNotif] = useState({
    horasRecordatorio: preferencias?.horasRecordatorio ?? 2,
    whatsappNumero: preferencias?.whatsappNumero ?? negocio?.telefono ?? "",
  })

  const [servicioForm, setServicioForm] = useState({ nombre: "", duracion: 30, precio: "" })
  const [editId, setEditId] = useState(null)
  const nombreServicioRef = useRef(null)

  const [pagos, setPagos] = useState({
    pagoEfectivo: preferencias?.pagoEfectivo !== false,
    pagoTransferencia: preferencias?.pagoTransferencia === true,
    pagoMp: preferencias?.pagoMp === true,
    transferenciasBanco: preferencias?.transferenciasBanco || "",
    transferenciasTipoCuenta: preferencias?.transferenciasTipoCuenta || "",
    transferenciasNumero: preferencias?.transferenciasNumero || "",
    transferenciasRut: preferencias?.transferenciasRut || "",
    transferenciasTitular: preferencias?.transferenciasTitular || "",
  })

  const [mpCreds, setMpCreds] = useState({ publicKey: "", accessToken: "" })
  const [waCreds, setWaCreds] = useState({ waToken: "", waPhoneId: "", waTemplateName: datosPago?.waTemplateName || "recordatorio_cita" })
  const [verGuia, setVerGuia] = useState(false)
  const [verGuiaMp, setVerGuiaMp] = useState(false)
  const [waTest, setWaTest] = useState({ telefono: "", estado: "idle", mensaje: "" })

  const miEmpleado = esBarbero ? empleados.find((e) => e.id === session?.barberoId) : null
  const [transfer, setTransfer] = useState({
    transferenciasBanco: miEmpleado?.transferenciasBanco || "",
    transferenciasTipoCuenta: miEmpleado?.transferenciasTipoCuenta || "",
    transferenciasNumero: miEmpleado?.transferenciasNumero || "",
    transferenciasRut: miEmpleado?.transferenciasRut || "",
    transferenciasTitular: miEmpleado?.transferenciasTitular || "",
  })
  const saveTransfer = (e) => {
    e.preventDefault()
    updateEmpleado(session.barberoId, transfer)
    push("Tus datos de transferencia se guardaron")
  }

  const toggleMetodo = (campo, valor) => {
    setPagos((prev) => ({ ...prev, [campo]: valor }))
    updatePreferencias({ [campo]: valor })
    push(valor ? "Método activado" : "Método desactivado")
  }

  const saveTransferenciasNegocio = (e) => {
    e.preventDefault()
    updatePreferencias({
      transferenciasBanco: pagos.transferenciasBanco,
      transferenciasTipoCuenta: pagos.transferenciasTipoCuenta,
      transferenciasNumero: pagos.transferenciasNumero,
      transferenciasRut: pagos.transferenciasRut,
      transferenciasTitular: pagos.transferenciasTitular,
    })
    push("Datos de transferencia guardados")
  }

  const saveMpCreds = (e) => {
    e.preventDefault()
    if (!mpCreds.publicKey.trim() || !mpCreds.accessToken.trim()) {
      push("Completa la Public Key y el Access Token", "error")
      return
    }
    guardarCredencialesMp({ publicKey: mpCreds.publicKey.trim(), accessToken: mpCreds.accessToken.trim() })
      .then(() => {
        updatePreferencias({ pagoMp: true })
        push("Credenciales de Mercado Pago guardadas")
        setMpCreds({ publicKey: "", accessToken: "" })
      })
      .catch((err) => push(err?.message || "No se pudieron guardar las credenciales", "error"))
  }

  const saveWaCreds = (e) => {
    e.preventDefault()
    if (!waCreds.waToken.trim() || !waCreds.waPhoneId.trim()) {
      push("Completa el Token de acceso y el ID del número", "error")
      return
    }
    guardarCredencialesWa({
      waToken: waCreds.waToken.trim(),
      waPhoneId: waCreds.waPhoneId.trim(),
      waTemplateName: waCreds.waTemplateName.trim() || "recordatorio_cita",
    })
      .then(() => {
        push("Conexión de WhatsApp guardada")
        setWaCreds((prev) => ({ ...prev, waToken: "", waPhoneId: "" }))
      })
      .catch((err) => push(err?.message || "No se pudieron guardar las credenciales", "error"))
  }

  const probarWa = async (e) => {
    e.preventDefault()
    const tel = waTest.telefono.trim()
    if (!tel) {
      setWaTest({ telefono: "", estado: "error", mensaje: "Escribe tu número con código de país, ej. +56912345678." })
      return
    }
    setWaTest((prev) => ({ ...prev, estado: "cargando", mensaje: "" }))
    try {
      const { data, error } = await supabase.rpc("probar_conexion_wa", { p_telefono: tel })
      if (error) throw new Error(error.message)
      const detalle = data?.detalle?.error?.message || (typeof data?.detalle === "string" ? data.detalle : "")
      setWaTest({
        telefono: tel,
        estado: data?.ok ? "ok" : "error",
        mensaje: data?.ok ? data.mensaje : (detalle || data?.mensaje || "La prueba falló, revisa que la plantilla esté aprobada."),
      })
    } catch (err) {
      setWaTest({ telefono: tel, estado: "error", mensaje: err?.message || "No se pudo probar la conexión" })
    }
  }

  const saveIdentidad = (e) => {
    e.preventDefault()
    updateNegocio(identidad)
    push("Negocio actualizado")
  }

  const saveNotif = (e) => {
    e.preventDefault()
    updatePreferencias({
      horasRecordatorio: Math.max(0, Number(notif.horasRecordatorio) || 0),
      whatsappNumero: notif.whatsappNumero,
    })
    push("Recordatorio actualizado")
  }

  const saveServicio = (e) => {
    e.preventDefault()
    if (!servicioForm.nombre.trim()) return
    const data = { nombre: servicioForm.nombre, duracion: Number(servicioForm.duracion), precio: Number(servicioForm.precio) }
    if (editId) {
      updateServicio(editId, data)
      push("Servicio actualizado")
    } else {
      addServicio(data)
      push("Servicio agregado")
    }
    setServicioForm({ nombre: "", duracion: 30, precio: "" })
    setEditId(null)
  }

  const startEdit = (s) => {
    setEditId(s.id)
    setServicioForm({ nombre: s.nombre, duracion: s.duracion, precio: String(s.precio) })
  }

  const cancelEdit = () => {
    setEditId(null)
    setServicioForm({ nombre: "", duracion: 30, precio: "" })
  }

  const input = "w-full mt-1 surface px-3 py-2 text-sm"
  const label = "block text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider"

  if (esBarbero) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-extrabold tracking-tight">Mi perfil</h1>
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><Key size={18} weight="duotone" className="text-[var(--accent)]" /> Preferencias</h2>
          <form onSubmit={saveNotif} className="surface p-6 space-y-4">
            <label className="block">
              <span className={label}>Teléfono de contacto</span>
              <input className={input} value={notif.whatsappNumero} onChange={(e) => setNotif({ ...notif, whatsappNumero: e.target.value })} placeholder="+56912345678" />
            </label>
            <div className="flex justify-end">
              <button type="submit" className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl">
                <Check size={16} weight="bold" /> Guardar
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><Bank size={18} weight="duotone" className="text-[var(--accent)]" /> Mis datos de transferencia</h2>
          <form onSubmit={saveTransfer} className="surface p-6 space-y-4">
            <p className="text-xs text-[var(--fg-muted)]">Estos datos verán tus clientes cuando reserven contigo y elijan pagar por transferencia.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Banco</label>
                <input className={input} value={transfer.transferenciasBanco} onChange={(e) => setTransfer({ ...transfer, transferenciasBanco: e.target.value })} placeholder="Ej. Banco Estado" />
              </div>
              <div>
                <label className={label}>Tipo de cuenta</label>
                <input className={input} value={transfer.transferenciasTipoCuenta} onChange={(e) => setTransfer({ ...transfer, transferenciasTipoCuenta: e.target.value })} placeholder="Cuenta corriente / vista / rut" />
              </div>
              <div>
                <label className={label}>N° de cuenta</label>
                <input className={input} value={transfer.transferenciasNumero} onChange={(e) => setTransfer({ ...transfer, transferenciasNumero: e.target.value })} placeholder="123456789" />
              </div>
              <div>
                <label className={label}>RUT</label>
                <input className={input} value={transfer.transferenciasRut} onChange={(e) => setTransfer({ ...transfer, transferenciasRut: e.target.value })} placeholder="11.111.111-1" />
              </div>
              <div>
                <label className={label}>Titular</label>
                <input className={input} value={transfer.transferenciasTitular} onChange={(e) => setTransfer({ ...transfer, transferenciasTitular: e.target.value })} placeholder="Nombre del titular" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl">
                <Check size={16} weight="bold" /> Guardar
              </button>
            </div>
          </form>
        </section>
        <p className="text-xs text-[var(--fg-muted)]">Desde aquí ves solo tu actividad. El dueño administra servicios, el negocio y el equipo.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-extrabold tracking-tight">Ajustes</h1>

      <button
        onClick={() => setView("personalizacion")}
        className="inline-flex items-center gap-2 surface px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--accent)]"
      >
        <Palette size={18} /> Personalizar barbería
      </button>

      {/* Identidad del negocio */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><Storefront size={18} weight="duotone" className="text-[var(--accent)]" /> Identidad del negocio</h2>
        <form onSubmit={saveIdentidad} className="surface p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Nombre del negocio</label>
              <input className={input} value={identidad.nombre} onChange={(e) => setIdentidad({ ...identidad, nombre: e.target.value })} required />
            </div>
            <div>
              <label className={label}>Teléfono</label>
              <input className={input} value={identidad.telefono} onChange={(e) => setIdentidad({ ...identidad, telefono: e.target.value })} placeholder="+56911112222" />
            </div>
            <div>
              <label className={label}>Dirección</label>
              <input className={input} value={identidad.direccion} onChange={(e) => setIdentidad({ ...identidad, direccion: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl">
              <Check size={16} weight="bold" /> Guardar negocio
            </button>
          </div>
        </form>
      </section>

      {/* Trabajadores */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><Users size={18} weight="duotone" className="text-[var(--accent)]" /> Trabajadores</h2>
        <Trabajadores />
      </section>

      {/* Tema visual */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><Palette size={18} weight="duotone" className="text-[var(--accent)]" /> Tema visual</h2>
        <div className="surface p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {THEMES.map((t) => {
              const active = theme === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`surface-hover flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    active ? "border-[var(--accent)] text-[var(--fg)]" : "text-[var(--fg-muted)]"
                  }`}
                >
                  <span>{t.label}</span>
                  {active && <Check size={16} weight="bold" className="text-[var(--accent)]" />}
                </button>
              )
            })}
          </div>
          <p className="mt-4 text-xs text-[var(--fg-muted)]">El tema se aplica al instante y queda guardado.</p>
        </div>
      </section>

      {/* Recordatorio WhatsApp */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><ChatTeardrop size={18} weight="duotone" className="text-[var(--accent)]" /> Recordatorio WhatsApp</h2>
        <form onSubmit={saveNotif} className="surface p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Horas antes del turno</label>
              <input type="number" min="0" step="1" className={input} value={notif.horasRecordatorio} onChange={(e) => setNotif({ ...notif, horasRecordatorio: e.target.value })} />
              <p className="mt-1 text-xs text-[var(--fg-muted)]">Se avisa al cliente {notif.horasRecordatorio || "2"} h antes de su cita.</p>
            </div>
            <div>
              <label className={label}>Número de WhatsApp</label>
              <input className={input} value={notif.whatsappNumero} onChange={(e) => setNotif({ ...notif, whatsappNumero: e.target.value })} placeholder="+56911112222" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl">
              <Check size={16} weight="bold" /> Guardar recordatorio
            </button>
          </div>
        </form>
        <p className="text-xs text-[var(--fg-muted)]">El aviso se envía automáticamente desde el servidor con los minutos de antelación elegidos.</p>
      </section>

      {/* Conexión WhatsApp Business */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><WhatsappLogo size={18} weight="duotone" className="text-[var(--accent)]" /> Conexión WhatsApp Business</h2>

        {datosPago?.waConfigurado ? (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}>
            <Check size={16} weight="bold" /> Conectado · plantilla «{datosPago?.waTemplateName || "recordatorio_cita"}»
          </div>
        ) : (
          <div className="rounded-xl px-4 py-3 text-sm font-medium text-[var(--fg-muted)]" style={{ background: "color-mix(in srgb, var(--accent) 8%, transparent)" }}>
            Sin conectar: los recordatorios automáticos no se envían hasta que guardes tus credenciales abajo (guía paso a paso más abajo).
          </div>
        )}

        <div className="surface p-6 space-y-4">
          <button type="button" onClick={() => setVerGuia(!verGuia)} className="w-full flex items-center justify-between gap-2 text-sm font-semibold text-[var(--fg)]">
            <span className="flex items-center gap-2"><ChatTeardrop size={16} weight="duotone" className="text-[var(--accent)]" /> ¿Cómo configurarlo? Guía paso a paso</span>
            <span className="text-[var(--fg-muted)]">{verGuia ? "▲" : "▼"}</span>
          </button>

          {verGuia && (
            <ol className="space-y-4 text-sm text-[var(--fg-muted)] list-none">
              <li>
                <p className="font-bold text-[var(--fg)]">1. Crea la app en Meta</p>
                <p>Entra a <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="underline">developers.facebook.com</a> con tu cuenta de Facebook o Instagram. Toca «Crear app» → tipo <b>Negocio</b> → añade el producto <b>WhatsApp</b>.</p>
              </li>
              <li>
                <p className="font-bold text-[var(--fg)]">2. Conecta tu número</p>
                <p>En «API Setup» verás tu número. Regístralo (verifica tu negocio si Meta lo pide). Junto al número aparece el <b>ID del número (Phone ID)</b> — es el que pegas en el campo «ID del número».</p>
              </li>
              <li>
                <p className="font-bold text-[var(--fg)]">3. Usa el token permanente (no el de 24 horas)</p>
                <p>El token que muestra «API Setup» dura solo <b>24 horas</b> y dejaría de funcionar. Para que nunca expire: <b>Configuración del negocio → Usuarios → Usuarios del sistema → Agregar</b> → asígnale los permisos <i>whatsapp_business_messaging</i> y <i>whatsapp_business_management</i> → «Generar token». Ese token sí es permanente: cópialo y pégalo aquí.</p>
              </li>
              <li>
                <p className="font-bold text-[var(--fg)]">4. Crea la plantilla</p>
                <p>Entra a <a href="https://business.facebook.com/wa/manage" target="_blank" rel="noreferrer" className="underline">business.facebook.com/wa/manage</a> → «Plantillas de mensajes» → «Crear plantilla». Nómbrala exactamente <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--fg)" }}>recordatorio_cita</code>, idioma Español, y escribe este texto:</p>
                <pre className="mt-2 whitespace-pre-wrap rounded-xl p-3 text-xs" style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}>{`Hola, te recordamos tu cita en {{1}} el {{2}} a las {{3}}. ¡Te esperamos!`}</pre>
                <p>Espera a que Meta la apruebe (suele tardar menos de una hora). La plantilla necesita exactamente esas 3 variables en ese orden.</p>
              </li>
              <li>
                <p className="font-bold text-[var(--fg)]">5. Guarda y prueba</p>
                <p>Pega el token y el ID del número abajo, toca «Guardar conexión» y luego «Probar conexión» con tu propio número para confirmar que todo funciona.</p>
              </li>
            </ol>
          )}
        </div>

        <form onSubmit={saveWaCreds} className="surface p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Token de acceso</label>
              <input type="password" className={input} value={waCreds.waToken} onChange={(e) => setWaCreds({ ...waCreds, waToken: e.target.value })} placeholder="EAAG... (token permanente del paso 3)" />
            </div>
            <div>
              <label className={label}>ID del número (Phone ID)</label>
              <input className={input} value={waCreds.waPhoneId} onChange={(e) => setWaCreds({ ...waCreds, waPhoneId: e.target.value })} placeholder="1xxxxxxxxxxxx3" />
            </div>
            <div>
              <label className={label}>Nombre de la plantilla</label>
              <input className={input} value={waCreds.waTemplateName} onChange={(e) => setWaCreds({ ...waCreds, waTemplateName: e.target.value })} placeholder="recordatorio_cita" />
              <p className="mt-1 text-xs text-[var(--fg-muted)]">Debe existir en WhatsApp Manager y tener 3 variables: {"{{1}}"} nombre del negocio, {"{{2}}"} fecha (DD/MM/AAAA), {"{{3}}"} hora (HH:MM).</p>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl">
              <Check size={16} weight="bold" /> Guardar conexión
            </button>
          </div>
        </form>

        <form onSubmit={probarWa} className="surface p-6 space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><ArrowRight size={16} weight="duotone" className="text-[var(--accent)]" /> Probar conexión</h3>
          <div>
            <label className={label}>Tu número de WhatsApp (con código de país)</label>
            <input className={input} value={waTest.telefono} onChange={(e) => setWaTest((prev) => ({ ...prev, telefono: e.target.value }))} placeholder="+56912345678" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-[var(--fg-muted)]">Te enviamos la plantilla a ese número para confirmar que token, número y plantilla están bien.</p>
            <button type="submit" disabled={waTest.estado === "cargando"} className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50">
              <ArrowRight size={16} weight="bold" /> {waTest.estado === "cargando" ? "Enviando…" : "Probar"}
            </button>
          </div>
          {waTest.mensaje && (
            <p className="rounded-xl px-3 py-2 text-xs font-medium" style={waTest.estado === "ok"
              ? { color: "#16a34a", background: "rgba(22,163,74,0.12)" }
              : { color: "#dc2626", background: "rgba(220,38,38,0.12)" }}>
              {waTest.mensaje}
            </p>
          )}
        </form>
      </section>

      {/* Página pública */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><ArrowRight size={18} weight="duotone" className="text-[var(--accent)]" /> Página pública</h2>
        <div className="surface p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Tu página de reservas online</p>
            <p className="text-xs text-[var(--fg-muted)]">Lo que ven tus clientes al escanear el QR.</p>
          </div>
          <a href={`#/c/${negocio?.slug}`} className="inline-flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl">
            <ArrowRight size={16} weight="bold" /> Ver página
          </a>
        </div>
      </section>

      {/* Métodos de pago */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><CurrencyDollar size={18} weight="duotone" className="text-[var(--accent)]" /> Métodos de pago</h2>

        <div className="surface p-6 space-y-4">
          {[
            { campo: "pagoEfectivo", label: "Efectivo", desc: "El cliente paga en la barbería." },
            { campo: "pagoTransferencia", label: "Transferencia", desc: "Muestras tus datos para transferencias. Cada barbero puede tener los suyos." },
            { campo: "pagoMp", label: "Mercado Pago", desc: datosPago?.mpConfigurado ? "Configurado con credenciales del negocio." : "Activa el cobro en línea. Requiere credenciales de Mercado Pago." },
          ].map(({ campo, label, desc }) => {
            const activo = pagos[campo]
            return (
              <div key={campo} className="flex items-center justify-between gap-3 border-b border-[var(--border)] last:border-0 pb-4 last:pb-0">
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-[var(--fg-muted)]">{desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={activo}
                  onClick={() => toggleMetodo(campo, !activo)}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${activo ? "bg-[var(--accent)]" : "bg-[var(--fg-muted)]/30"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${activo ? "translate-x-5" : ""}`} />
                </button>
              </div>
            )
          })}
        </div>

        {pagos.pagoTransferencia && (
          <form onSubmit={saveTransferenciasNegocio} className="surface p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><Bank size={16} weight="duotone" className="text-[var(--accent)]" /> Datos del negocio</h3>
            <p className="text-xs text-[var(--fg-muted)]">Se muestran al cliente cuando reserva sin elegir un barbero específico.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Banco</label>
                <input className={input} value={pagos.transferenciasBanco} onChange={(e) => setPagos({ ...pagos, transferenciasBanco: e.target.value })} placeholder="Ej. Banco Estado" />
              </div>
              <div>
                <label className={label}>Tipo de cuenta</label>
                <input className={input} value={pagos.transferenciasTipoCuenta} onChange={(e) => setPagos({ ...pagos, transferenciasTipoCuenta: e.target.value })} placeholder="Cuenta corriente / vista / rut" />
              </div>
              <div>
                <label className={label}>N° de cuenta</label>
                <input className={input} value={pagos.transferenciasNumero} onChange={(e) => setPagos({ ...pagos, transferenciasNumero: e.target.value })} placeholder="123456789" />
              </div>
              <div>
                <label className={label}>RUT</label>
                <input className={input} value={pagos.transferenciasRut} onChange={(e) => setPagos({ ...pagos, transferenciasRut: e.target.value })} placeholder="11.111.111-1" />
              </div>
              <div>
                <label className={label}>Titular</label>
                <input className={input} value={pagos.transferenciasTitular} onChange={(e) => setPagos({ ...pagos, transferenciasTitular: e.target.value })} placeholder="Nombre del titular" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl">
                <Check size={16} weight="bold" /> Guardar datos
              </button>
            </div>
          </form>
        )}

        {pagos.pagoMp && (
          <form onSubmit={saveMpCreds} className="surface p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><CreditCard size={16} weight="duotone" className="text-[var(--accent)]" /> Credenciales de Mercado Pago</h3>
            <p className="text-xs text-[var(--fg-muted)]">
              {datosPago?.mpConfigurado ? "Ya hay credenciales guardadas. Puedes reemplazarlas aquí." : "Estas credenciales se guardan en el backend y nunca se muestran en el navegador."}
            </p>

            <div className="space-y-4 rounded-xl p-4" style={{ background: "color-mix(in srgb, var(--accent) 8%, transparent)" }}>
              <button type="button" onClick={() => setVerGuiaMp(!verGuiaMp)} className="w-full flex items-center justify-between gap-2 text-sm font-semibold text-[var(--fg)]">
                <span className="flex items-center gap-2"><Bank size={16} weight="duotone" className="text-[var(--accent)]" /> ¿Cómo obtenerlas? Guía paso a paso</span>
                <span className="text-[var(--fg-muted)]">{verGuiaMp ? "▲" : "▼"}</span>
              </button>

              {verGuiaMp && (
                <ol className="space-y-4 text-sm text-[var(--fg-muted)] list-none">
                  <li>
                    <p className="font-bold text-[var(--fg)]">1. Ten una cuenta de Mercado Pago</p>
                    <p>Crea tu cuenta en <a href="https://www.mercadopago.com" target="_blank" rel="noreferrer" className="underline">mercadopago.com</a> (o usa la que ya tengas). Verifícala con los datos de tu negocio: ese número de cuenta será el que recibe el dinero.</p>
                  </li>
                  <li>
                    <p className="font-bold text-[var(--fg)]">2. Entra al panel de desarrolladores</p>
                    <p>Entra a <a href="https://developers.mercadopago.com" target="_blank" rel="noreferrer" className="underline">developers.mercadopago.com</a> e inicia sesión con la misma cuenta. En «Mis aplicaciones» crea una aplicación (o usa la que ya tengas).</p>
                  </li>
                  <li>
                    <p className="font-bold text-[var(--fg)]">3. Copia las dos credenciales</p>
                    <p>Dentro de tu aplicación ve a «Credenciales». Ahí están la <b>Public Key</b> y el <b>Access Token</b> (empiezan con <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--fg)" }}>APP_USR-…</code>). Son dos códigos distintos: uno va en «Public Key» y el otro en «Access Token».</p>
                  </li>
                  <li>
                    <p className="font-bold text-[var(--fg)]">4. Activa el modo producción</p>
                    <p>Para cobrar de verdad necesitas completar la <b>verificación de producción</b> (botón «Completar el flujo de producción» en el panel). Las credenciales que empiezan con <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--fg)" }}>TEST-…</code> sirven solo para probar y no cobran de verdad.</p>
                  </li>
                  <li>
                    <p className="font-bold text-[var(--fg)]">5. Pega y guarda</p>
                    <p>Pega la <b>Public Key</b> y el <b>Access Token</b> abajo y toca «Guardar credenciales». El interruptor de Mercado Pago en «Métodos de pago» ya quedará activado.</p>
                  </li>
                </ol>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Public Key</label>
                <input className={input} value={mpCreds.publicKey} onChange={(e) => setMpCreds({ ...mpCreds, publicKey: e.target.value })} placeholder="APP_USR-..." />
              </div>
              <div>
                <label className={label}>Access Token</label>
                <input type="password" className={input} value={mpCreds.accessToken} onChange={(e) => setMpCreds({ ...mpCreds, accessToken: e.target.value })} placeholder="APP_USR-..." />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl">
                <Check size={16} weight="bold" /> Guardar credenciales
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Servicios */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><Scissors size={18} weight="duotone" className="text-[var(--accent)]" /> Servicios</h2>
        <form onSubmit={saveServicio} className="surface p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_120px_140px_auto] sm:items-end">
            <div>
              <label className={label}>Nombre</label>
              <input ref={nombreServicioRef} className={input} value={servicioForm.nombre} onChange={(e) => setServicioForm({ ...servicioForm, nombre: e.target.value })} placeholder="Corte clásico" required />
            </div>
            <div>
              <label className={label}>Duración (min)</label>
              <input type="number" className={input} value={servicioForm.duracion} onChange={(e) => setServicioForm({ ...servicioForm, duracion: e.target.value })} min="5" step="5" />
            </div>
            <div>
              <label className={label}>Precio ($)</label>
              <input type="number" className={input} value={servicioForm.precio} onChange={(e) => setServicioForm({ ...servicioForm, precio: e.target.value })} placeholder="12000" min="0" required />
            </div>
            <div className="flex gap-2">
              {editId && (
                <button type="button" onClick={cancelEdit} className="surface px-3 py-2 text-sm"><X size={16} /></button>
              )}
              <button type="submit" className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl">
                <Plus size={16} weight="bold" /> {editId ? "Guardar" : "Agregar"}
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-2">
          {servicios?.map((s) => (
            <div key={s.id} className="surface flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{s.nombre}</p>
                <p className="text-xs text-[var(--fg-muted)]">{s.duracion} min</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-extrabold">${(s.precio || 0).toLocaleString("es-CL")}</p>
                <button onClick={() => startEdit(s)} className="text-[var(--fg-muted)] hover:text-[var(--accent)]"><PencilSimple size={16} /></button>
                <button onClick={() => { removeServicio(s.id); push("Servicio eliminado") }} className="text-[var(--fg-muted)] hover:text-red-500"><Trash size={16} /></button>
              </div>
            </div>
          ))}
          {(servicios?.length || 0) === 0 && (
          <EstadoVacio
            icono={Scissors}
            titulo="No hay servicios"
            descripcion="Agrega el primero y aparecerá en tu página pública."
            cta="Agregar servicio"
            onCta={() => nombreServicioRef.current?.focus()}
          />
        )}
        </div>
      </section>
    </div>
  )
}

function Trabajadores() {
  const { empleados, addEmpleado, updateEmpleado, resetearClave } = useStore()
  const push = useToast()
  const nombreTrabajadorRef = useRef(null)
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [ocupado, setOcupado] = useState(false)

  const agregar = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    setOcupado(true)
    try {
      await addEmpleado(nombre.trim(), email.trim() || undefined)
      setNombre("")
      setEmail("")
      push(email.trim() ? "Barbero agregado: dile que use «Olvidé mi contraseña» para fijar su clave" : "Barbero agregado")
    } catch (err) {
      push(err?.message || "No se pudo agregar el barbero", "error")
    } finally {
      setOcupado(false)
    }
  }

  const toggleActivado = async (e, ev) => {
    ev.stopPropagation()
    ev.preventDefault()
    const activado = !e.activado
    try {
      await updateEmpleado(e.id, { activado })
      push(activado ? "Empleado reactivado" : "Empleado desactivado")
    } catch (err) {
      push(err?.message || "No se pudo actualizar", "error")
    }
  }

  const resetClaveDe = (e, ev) => {
    ev.stopPropagation()
    ev.preventDefault()
    push(resetearClave())
  }

  return (
    <div className="space-y-3">
      <form onSubmit={agregar} className="surface p-5 flex flex-col sm:flex-row gap-3">
        <input
          className="flex-1 surface px-3 py-2.5 text-sm outline-none"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del barbero"
          required
        />
        <input
          type="email"
          className="flex-1 surface px-3 py-2.5 text-sm outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@acceso (opcional)"
        />
        <button type="submit" disabled={ocupado} className="flex items-center justify-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-40">
          <Plus size={16} weight="bold" /> {ocupado ? "Agregando…" : "Agregar"}
        </button>
      </form>

      <div className="space-y-2">
        {empleados.map((e) => (
          <div key={e.id} className="surface flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{e.nombre}</p>
              <p className="text-xs text-[var(--fg-muted)]">
                {e.usuarioAuth ? "Tiene cuenta de acceso" : "Sin cuenta de acceso"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!e.activado && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-red-500/10 text-red-600">Inactivo</span>}
              <button onClick={(ev) => resetClaveDe(e, ev)} className="text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--accent)]">
                Reset clave
              </button>
              <button onClick={(ev) => toggleActivado(e, ev)} className="text-[var(--fg-muted)] hover:text-amber-600" title={e.activado ? "Desactivar" : "Reactivar"}>
                {e.activado ? <Power size={18} /> : <UserCircle size={18} />}
              </button>
            </div>
          </div>
        ))}
        {empleados.length === 0 && <p className="text-sm text-[var(--fg-muted)]">Aún no agregas trabajadores.</p>}
      </div>
    </div>
  )
}