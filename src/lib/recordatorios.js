import { useEffect, useRef } from "react"
import { useStore } from "@/context/store"
import { enviarRecordatorio } from "./whatsapp"

const KEY = "saas-barberias:v1:enviados"
const INTERVALO_MS = 60_000

function cargarEnviados() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]")
  } catch {
    return []
  }
}

function guardarEnviados(lista) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lista))
  } catch {
    /* almacenamiento no disponible */
  }
}

// Convierte fecha "YYYY-MM-DD" + hora "HH:MM" a un Date local.
const aDate = (fecha, hora) => {
  const d = new Date(`${fecha}T${hora}:00`)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Motor de recordatorios. Mientras la app está abierta escanea los turnos
 * confirmados y dispara el aviso de WhatsApp `horasRecordatorio` antes de la cita.
 * Cada turno se envía una sola vez (persistido en localStorage).
 */
export function useRecordatorios() {
  const store = useStore()
  const ref = useRef(store)
  ref.current = store

  useEffect(() => {
    const revisar = () => {
      const { turnos, clientes, negocio, preferencias } = ref.current
      const horas = Math.max(0, Number(preferencias?.horasRecordatorio ?? 2))
      const ahora = Date.now()
      const margenInicio = horas * 3600_000
      const ventana = new Set(cargarEnviados())

      turnos.forEach((t) => {
        const confirmado = !t.estado || t.estado === "confirmado"
        if (!confirmado) return
        const inicio = aDate(t.fecha, t.hora)
        if (!inicio) return
        const faltante = inicio.getTime() - ahora
        if (!(faltante > 0 && faltante <= margenInicio)) return

        const id = t.id || `${t.fecha}-${t.hora}`
        if (ventana.has(id)) return
        const cliente = clientes.find((c) => c.id === t.clienteId)
        const telefono = cliente?.telefono || preferencias?.whatsappNumero
        if (!telefono) return

        enviarRecordatorio({
          to: telefono,
          destinatario: cliente?.nombre || "cliente",
          fecha: t.fecha,
          hora: t.hora,
          nombreNegocio: negocio.nombre,
          variables: [negocio.nombre, t.fecha, t.hora],
        }).finally(() => {})

        ventana.add(id)
        guardarEnviados([...ventana])
      })
    }

    revisar()
    const iv = setInterval(revisar, INTERVALO_MS)
    return () => clearInterval(iv)
  }, [])
}