import { StoreProvider, useStore } from "@/context/store"
import Sidebar from "@/components/Sidebar"
import Topbar from "@/components/Topbar"
import Dashboard from "@/components/dashboard/Dashboard"

function Shell() {
  const { view } = useStore()

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Topbar />
        <main className="flex-1 p-6">
          {view === "dashboard" && <Dashboard />}
          {view === "agenda" && <p className="text-sm text-[var(--fg-muted)]">Agenda (provisional)</p>}
          {view === "clientes" && <p className="text-sm text-[var(--fg-muted)]">Clientes (provisional)</p>}
          {view === "ventas" && <p className="text-sm text-[var(--fg-muted)]">Ventas (provisional)</p>}
          {view === "qr" && <p className="text-sm text-[var(--fg-muted)]">QR (provisional)</p>}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
