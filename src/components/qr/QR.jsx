import { motion } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import { QrCode, Eye, ArrowSquareOut } from "@phosphor-icons/react"
import { useStore } from "@/context/store"
import { formatCLP } from "@/lib/format"
import { navegarA } from "@/lib/router"

export default function QR() {
  const { negocio, qrStats } = useStore()
  // scans may carry an optional monto (a scan is not a sale)
  const total = qrStats.reduce((s, q) => s + (q.monto || 0), 0)
  const publicUrl = `${window.location.origin}${window.location.pathname}#/c/${negocio.slug}`

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-extrabold tracking-tight">QR de la barberÃ­a</h1>
        <p className="text-sm text-[var(--fg-muted)]">Pega este QR en tu vitrina para que tus clientes te vean al instante.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center gap-6 surface surface-hover rounded-2xl p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent)] text-white">
            <QrCode size={32} weight="duotone" />
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold tracking-tight">{negocio?.nombre || "Mi barberÃ­a"}</p>
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
              <p className="text-xs text-[var(--fg-muted)]">Ventas por QR</p>
              <p className="text-2xl font-extrabold">{formatCLP(total)}</p>
            </div>
            <Eye size={24} weight="duotone" className="text-[var(--accent)]" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}