import { motion } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import { QrCode, Eye, ArrowSquareOut } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { navegarA } from "@/lib/router"

export default function QR() {
  const { negocio, qrStats } = useStore()
  const fechaCorte = new Date(Date.now() - 7 * 86400000).toISOString()
  const estaSemana = qrStats.filter((q) => (q.fechaHora || "") >= fechaCorte).length
  const publicUrl = `${window.location.origin}${window.location.pathname}#/c/${negocio.slug}?tema=${negocio.tema || "elegante"}`

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-extrabold tracking-tight">QR de la barbería</h1>
        <p className="text-sm text-[var(--fg-muted)]">Pega este QR en tu vitrina para que tus clientes te vean al instante.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center gap-6 surface surface-hover rounded-2xl p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent)] text-white">
            <QrCode size={32} weight="duotone" />
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold tracking-tight">{negocio?.nombre || "Mi barbería"}</p>
            <p className="text-xs text-[var(--fg-muted)]">{negocio?.direccion}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl">
          <QRCodeSVG value={publicUrl} size={200} fgColor="#111827" bgColor="#ffffff" />
        </div>
        <p className="text-xs text-[var(--fg-muted)]">Escanéalo para ver tu página y reservar online.</p>
        <button
          onClick={() => navegarA(`/c/${negocio.slug}`)}
          className="inline-flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 rounded-xl"
        >
          <ArrowSquareOut size={16} weight="bold" /> Ver página pública
        </button>

        <div className="w-full max-w-xs space-y-2">
          <div className="flex items-center justify-between surface px-4 py-3">
            <div>
              <p className="text-xs text-[var(--fg-muted)]">Escaneos</p>
              <p className="text-2xl font-extrabold">{qrStats.length}</p>
            </div>
            <Eye size={24} weight="duotone" className="text-[var(--accent)]" />
          </div>
          <div className="flex items-center justify-between surface px-4 py-3">
            <div>
              <p className="text-xs text-[var(--fg-muted)]">Esta semana</p>
              <p className="text-2xl font-extrabold">{estaSemana}</p>
            </div>
            <Eye size={24} weight="duotone" className="text-[var(--accent)]" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}