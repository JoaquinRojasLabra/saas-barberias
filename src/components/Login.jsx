import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Scissors, Lock } from "@phosphor-icons/react"
import { useAuth } from "@/lib/auth"
import { useStore } from "@/context/store"

export default function Login() {
  const { login } = useAuth()
  const { negocio } = useStore()
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")
  const [error, setError] = useState(false)

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(false), 2500)
      return () => clearTimeout(t)
    }
  }, [error])

  const submit = (e) => {
    e.preventDefault()
    if (!login(user, pass)) setError(true)
  }

  const input = "w-full mt-1 surface px-3 py-2.5 text-sm outline-none"

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onSubmit={submit}
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
            <h1 className="text-xl font-extrabold tracking-tight">{negocio.nombre}</h1>
            <p className="text-sm text-[var(--fg-muted)]">Inicia sesión para continuar</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Usuario</span>
            <input value={user} onChange={(e) => setUser(e.target.value)} className={input} placeholder="demo" autoComplete="username" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Contraseña</span>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className={input} placeholder="••••••••" autoComplete="current-password" />
          </label>
        </div>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-red-500">
            <Lock size={14} weight="bold" /> Usuario o contraseña incorrectos
          </motion.p>
        )}

        <button type="submit" disabled={!user || !pass} className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-semibold py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed">
          Entrar al panel
        </button>

        <p className="text-center text-xs text-[var(--fg-muted)]">Cuenta demo · usuario: <b>demo</b> · contraseña: <b>barberia</b></p>
      </motion.form>
    </div>
  )
}