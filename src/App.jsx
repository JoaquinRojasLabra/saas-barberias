import { lazy, Suspense } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { StoreProvider, useStore } from "@/context/store"
import { ToastProvider } from "@/lib/toast"
import { AuthProvider, useAuth } from "@/lib/auth"
import Background from "@/components/Background"
import Sidebar from "@/components/Sidebar"
import Topbar from "@/components/Topbar"
import Login from "@/components/Login"
import Dashboard from "@/components/dashboard/Dashboard"
import Agenda from "@/components/agenda/Agenda"
import Ventas from "@/components/ventas/Ventas"
import Clientes from "@/components/clientes/Clientes"
import QR from "@/components/qr/QR"
import Ajustes from "@/components/ajustes/Ajustes"

const ParticleField = lazy(() => import("@/components/ParticleField"))

function Shell() {
  const { view } = useStore()
  const { authed } = useAuth()

  if (!authed) return <Login />

  return (
    <div className="flex h-screen relative">
      <Background />
      <Suspense fallback={null}>
        <ParticleField />
      </Suspense>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Topbar />
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {view === "dashboard" && <Dashboard />}
              {view === "agenda" && <Agenda />}
              {view === "clientes" && <Clientes />}
              {view === "ventas" && <Ventas />}
              {view === "qr" && <QR />}
              {view === "ajustes" && <Ajustes />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </AuthProvider>
    </StoreProvider>
  )
}
