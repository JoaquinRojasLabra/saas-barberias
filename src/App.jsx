import { StoreProvider, useStore } from "@/context/store"
import Sidebar from "@/components/Sidebar"
import Topbar from "@/components/Topbar"
import Dashboard from "@/components/dashboard/Dashboard"
import Agenda from "@/components/agenda/Agenda"
import Ventas from "@/components/ventas/Ventas"
import Clientes from "@/components/clientes/Clientes"
import QR from "@/components/qr/QR"

function Shell() {
  const { view } = useStore()

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Topbar />
        <main className="flex-1 p-6">
          {view === "dashboard" && <Dashboard />}
          {view === "agenda" && <Agenda />}
          {view === "clientes" && <Clientes />}
          {view === "ventas" && <Ventas />}
          {view === "qr" && <QR />}
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
