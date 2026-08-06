import { useState } from "react"
import { Plus, Trash, PencilSimple, Check, X, Storefront, Palette, Scissors, Clock, Key, ChatTeardrop, ArrowSquareOut } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { useTheme } from "@/lib/theme"
import { useToast } from "@/lib/toast"
import { useAuth } from "@/lib/auth"

export default function Ajustes() {
  const { negocio, servicios, updateNegocio, updatePreferencias, preferencias, addServicio, updateServicio, removeServicio } = useStore()
  const { theme, setTheme, THEMES } = useTheme()
  const push = useToast()
  const { updateCredentials } = useAuth()

  const [identidad, setIdentidad] = useState({
    nombre: negocio.nombre,
    direccion: negocio.direccion,
    telefono: negocio.telefono,
    qrUrl: negocio.qrUrl,
  })

  const [notif, setNotif] = useState({
    horasRecordatorio: preferencias?.horasRecordatorio ?? 2,
    whatsappNumero: preferencias?.whatsappNumero ?? negocio.telefono,
  })

  const [servicioForm, setServicioForm] = useState({ nombre: "", duracion: 30, precio: "" })
  const [editId, setEditId] = useState(null)

  const [creds, setCreds] = useState({ user: "", pass: "", confirm: "" })

  const saveCreds = (e) => {
    e.preventDefault()
    if (!creds.user.trim() || !creds.pass) return
    if (creds.pass !== creds.confirm) return
    updateCredentials(creds.user.trim(), creds.pass)
    setCreds({ user: "", pass: "", confirm: "" })
    push("Credenciales actualizadas")
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

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-extrabold tracking-tight">Ajustes</h1>

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
            <div>
              <label className={label}>Link del QR (WhatsApp)</label>
              <input className={input} value={identidad.qrUrl} onChange={(e) => setIdentidad({ ...identidad, qrUrl: e.target.value })} placeholder="https://wa.me/56911112222" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl">
              <Check size={16} weight="bold" /> Guardar negocio
            </button>
          </div>
        </form>
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
              <p className="mt-1 text-xs text-[var(--fg-muted)]">Se avisa al cliente {typeof notif.horasRecordatorio === "number" || notif.horasRecordatorio ? notif.horasRecordatorio : "2"} h antes de su cita.</p>
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
      </section>

      {/* Página pública */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><ArrowSquareOut size={18} weight="duotone" className="text-[var(--accent)]" /> Página pública</h2>
        <div className="surface p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Tu página de reservas online</p>
            <p className="text-xs text-[var(--fg-muted)]">Lo que ven tus clientes al escanear el QR.</p>
          </div>
          <a href={`#/c/${negocio.slug}`} className="inline-flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl">
            <ArrowSquareOut size={16} weight="bold" /> Ver página
          </a>
        </div>
      </section>

      {/* Servicios */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><Scissors size={18} weight="duotone" className="text-[var(--accent)]" /> Servicios</h2>
        <form onSubmit={saveServicio} className="surface p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_120px_140px_auto] sm:items-end">
            <div>
              <label className={label}>Nombre</label>
              <input className={input} value={servicioForm.nombre} onChange={(e) => setServicioForm({ ...servicioForm, nombre: e.target.value })} placeholder="Corte clásico" required />
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
              {editId ? (
                <button type="button" onClick={cancelEdit} className="surface px-3 py-2 text-sm"><X size={16} /></button>
              ) : null}
              <button type="submit" className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl">
                <Plus size={16} weight="bold" /> {editId ? "Guardar" : "Agregar"}
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-2">
          {servicios.map((s) => (
            <div key={s.id} className="surface flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{s.nombre}</p>
                <p className="text-xs text-[var(--fg-muted)]">{s.duracion} min</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-extrabold">${s.precio.toLocaleString("es-CL")}</p>
                <button onClick={() => startEdit(s)} className="text-[var(--fg-muted)] hover:text-[var(--accent)]"><PencilSimple size={16} /></button>
                <button onClick={() => { removeServicio(s.id); push("Servicio eliminado") }} className="text-[var(--fg-muted)] hover:text-red-500"><Trash size={16} /></button>
              </div>
            </div>
          ))}
          {servicios.length === 0 && <p className="text-sm text-[var(--fg-muted)]">No hay servicios. Agrega el primero arriba.</p>}
        </div>
      </section>

      {/* Horario */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><Clock size={18} weight="duotone" className="text-[var(--accent)]" /> Horario (próximamente)</h2>
        <div className="surface p-6">
          <p className="text-sm text-[var(--fg-muted)]">La gestión de horarios y empleados llega en la siguiente fase.</p>
        </div>
      </section>

      {/* Acceso */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><Key size={18} weight="duotone" className="text-[var(--accent)]" /> Acceso del barbero</h2>
        <form onSubmit={saveCreds} className="surface p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={label}>Usuario</label>
              <input className={input} value={creds.user} onChange={(e) => setCreds({ ...creds, user: e.target.value })} placeholder="demo" required />
            </div>
            <div>
              <label className={label}>Nueva contraseña</label>
              <input type="password" className={input} value={creds.pass} onChange={(e) => setCreds({ ...creds, pass: e.target.value })} placeholder="••••••••" required />
            </div>
            <div>
              <label className={label}>Confirmar contraseña</label>
              <input type="password" className={input} value={creds.confirm} onChange={(e) => setCreds({ ...creds, confirm: e.target.value })} placeholder="••••••••" required />
            </div>
          </div>
          {creds.pass && creds.confirm && creds.pass !== creds.confirm && (
            <p className="text-xs text-red-500">Las contraseñas no coinciden.</p>
          )}
          <div className="flex justify-end">
            <button type="submit" className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl">
              <Check size={16} weight="bold" /> Guardar credenciales
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
