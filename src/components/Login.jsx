import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Scissors, Lock, Storefront, EnvelopeSimple, ArrowLeft } from "@phosphor-icons/react"
import { useAuth } from "@/lib/auth"
import { useStore } from "@/context/store"
import { useToast } from "@/lib/toast"
import { cn } from "@/lib/utils"

export default function Login() {
  const { login } = useAuth()
  const { registrarNegocio, recuperarClave, actualizarClave, finRecuperacion, recuperando } = useStore()
  const toast = useToast()

  const [modo, setModo] = useState(recuperando ? "nueva" : "entrar")
  const [email, setEmail] = useState("")
  const [pass, setPass] = useState("")
  const [error, setError] = useState("")
  const [aviso, setAviso] = useState("")
  const [ocupado, setOcupado] = useState(false)

  const [nuevo, setNuevo] = useState({ nombre: "", telefono: "", email: "", clave: "" })
  const [errorNuevo, setErrorNuevo] = useState("")
  const [ocupadoNuevo, setOcupadoNuevo] = useState(false)

  const [nueva1, setNueva1] = useState("")
  const [nueva2, setNueva2] = useState("")

  useEffect(() => {
    if (recuperando) {
      setModo("nueva")
      setError("")
      setAviso("")
    }
  }, [recuperando])

  const cambiarModo = (m) => {
    setModo(m)
    setError("")
    setAviso("")
  }

  const submit = async (e) => {
    e.preventDefault()
    setError("")
    setAviso("")
    setOcupado(true)
    try {
      await login(email.trim(), pass)
    } catch (err) {
      setError(err?.message || "Email o contraseña incorrectos")
    } finally {
      setOcupado(false)
    }
  }

  const crear = async (e) => {
    e.preventDefault()
    if (!nuevo.nombre.trim() || !nuevo.email.trim() || !nuevo.clave) {
      setErrorNuevo("Completa nombre, email y contraseña.")
      return
    }
    setErrorNuevo("")
    setOcupadoNuevo(true)
    try {
      const res = await registrarNegocio({
        nombre: nuevo.nombre.trim(),
        telefono: nuevo.telefono.trim(),
        email: nuevo.email.trim(),
        password: nuevo.clave,
      })
      if (res?.sesion) {
        toast(`¡Barbería creada! Bienvenido a ${nuevo.nombre.trim()}`)
      } else {
        cambiarModo("entrar")
        setEmail(nuevo.email.trim())
        setAviso("Cuenta creada. Si recibiste un correo de confirmación, actívalo y luego inicia sesión.")
      }
    } catch (err) {
      setErrorNuevo(err?.message || "No se pudo crear la barbería.")
    } finally {
      setOcupadoNuevo(false)
    }
  }

  const enviarEnlace = async (e) => {
    e.preventDefault()
    setError("")
    setAviso("")
    if (!email.trim()) {
      setError("Ingresa tu email para recuperar la contraseña.")
      return
    }
    setOcupado(true)
    try {
      await recuperarClave(email.trim())
      setAviso("Te enviamos un enlace para restablecer tu contraseña. Revisa tu correo.")
    } catch (err) {
      setError(err?.message || "No se pudo enviar el enlace")
    } finally {
      setOcupado(false)
    }
  }

  const nuevaClave = async (e) => {
    e.preventDefault()
    setError("")
    setAviso("")
    if (!nueva1 || nueva1.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }
    if (nueva1 !== nueva2) {
      setError("Las contraseñas no coinciden.")
      return
    }
    setOcupado(true)
    try {
      await actualizarClave(nueva1)
      await finRecuperacion()
      cambiarModo("entrar")
      setAviso("Contraseña actualizada. Inicia sesión con tu nueva contraseña.")
    } catch (err) {
      setError(err?.message || "No se pudo actualizar la contraseña")
    } finally {
      setOcupado(false)
    }
  }

  const input = "w-full mt-1 surface px-3 py-2.5 text-sm outline-none"

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onSubmit={modo === "entrar" ? submit : modo === "crear" ? crear : modo === "recuperar" ? enviarEnlace : nuevaClave}
        className="w-full max-w-sm surface p-8 space-y-5"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center shadow-[var(--shadow-lg)]"
          >
            <Scissors size={32} weight="duotone" />
          </motion.span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" id="login-titulo">
              {modo === "entrar" && "Inicia sesión"}
              {modo === "crear" && "Crea tu barbería"}
              {modo === "recuperar" && "Recupera tu acceso"}
              {modo === "nueva" && "Nueva contraseña"}
            </h1>
            <p className="text-sm text-[var(--fg-muted)]">
              {modo === "entrar" && "Accede con tu email"}
              {modo === "crear" && "Empieza hoy, en minutos"}
              {modo === "recuperar" && "Te enviaremos un enlace a tu correo"}
              {modo === "nueva" && "Elige una contraseña nueva para tu cuenta"}
            </p>
          </div>
        </div>

        {modo === "entrar" || modo === "crear" ? (
          <div className="flex p-1 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
            {["entrar", "crear"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => cambiarModo(m)}
                className={cn(
                  "relative flex-1 py-2 rounded-lg text-sm font-semibold transition-colors",
                  modo === m ? "text-white" : "text-[var(--fg-muted)] hover:text-[var(--fg)]",
                )}
              >
                {modo === m && (
                  <motion.span layoutId="login-pill" className="absolute inset-0 rounded-lg bg-[var(--accent)] shadow-[var(--shadow)]" transition={{ type: "spring", stiffness: 420, damping: 32 }} />
                )}
                <span className="relative z-10"> {m === "entrar" ? "Entrar" : "Crear cuenta"}</span>
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => cambiarModo("entrar")}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            <ArrowLeft size={14} weight="bold" /> Volver a iniciar sesión
          </button>
        )}

        {modo === "entrar" && (
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} placeholder="tu@barberia.com" autoComplete="email" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Contraseña</span>
              <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className={input} placeholder="••••••••" autoComplete="current-password" />
            </label>
            <div className="flex justify-end">
              <button type="button" onClick={() => cambiarModo("recuperar")} className="text-xs font-semibold text-[var(--accent)] hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>
        )}

        {modo === "crear" && (
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Nombre del negocio</span>
              <input value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} className={input} placeholder="Barbería El Cauce" autoComplete="organization" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Teléfono</span>
              <input value={nuevo.telefono} onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })} className={input} placeholder="+56911112222" inputMode="tel" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Tu email (dueño)</span>
              <input value={nuevo.email} onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} className={input} placeholder="tu@barberia.com" autoComplete="username" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Contraseña</span>
              <input type="password" value={nuevo.clave} onChange={(e) => setNuevo({ ...nuevo, clave: e.target.value })} className={input} placeholder="••••••••" autoComplete="new-password" />
            </label>
          </div>
        )}

        {modo === "recuperar" && (
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} placeholder="tu@barberia.com" autoComplete="email" />
            </label>
            {aviso && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-green-600">
                <EnvelopeSimple size={14} weight="bold" /> {aviso}
              </motion.p>
            )}
          </div>
        )}

        {modo === "nueva" && (
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Nueva contraseña</span>
              <input type="password" value={nueva1} onChange={(e) => setNueva1(e.target.value)} className={input} placeholder="••••••••" autoComplete="new-password" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Repite la contraseña</span>
              <input type="password" value={nueva2} onChange={(e) => setNueva2(e.target.value)} className={input} placeholder="••••••••" autoComplete="new-password" />
            </label>
          </div>
        )}

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-red-500">
            <Lock size={14} weight="bold" /> {error}
          </motion.p>
        )}
        {errorNuevo && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-red-500">
            <Storefront size={14} weight="bold" /> {errorNuevo}
          </motion.p>
        )}
        {modo === "entrar" && aviso && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-green-600">
            <EnvelopeSimple size={14} weight="bold" /> {aviso}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={ocupado || ocupadoNuevo || (modo === "entrar" ? !email || !pass : modo === "crear" ? !nuevo.nombre || !nuevo.email || !nuevo.clave : false)}
          className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-semibold py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {ocupado || ocupadoNuevo
            ? "Un momento…"
            : modo === "entrar" ? "Entrar al panel"
            : modo === "crear" ? "Crear barbería"
            : modo === "recuperar" ? "Enviar enlace"
            : "Cambiar contraseña"}
        </button>

        {(modo === "entrar" || modo === "crear") && (
          <p className="text-center text-xs text-[var(--fg-muted)]">
            Demo · <b>demo@barberia.app</b> (dueño) · <b>sebastian@barberia.app</b> (barbero)
          </p>
        )}
      </motion.form>
    </div>
  )
}