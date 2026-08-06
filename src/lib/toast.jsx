import { createContext, useContext, useState, useCallback } from "react"
import { CheckCircle, X } from "@phosphor-icons/react"

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, type = "success") => {
    const id = `t${Date.now()}`
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200)
  }, [])

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl surface shadow-[var(--shadow-lg)] text-sm font-medium text-[var(--fg)]"
          >
            <CheckCircle size={18} weight="bold" className="text-green-500" />
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="ml-1 text-[var(--fg-muted)] hover:text-[var(--fg)]">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}