import { useEffect } from "react"

/**
 * Motor de recordatorios MOVED a servidor.
 * Ahora lo ejecuta pg_cron (función public.enviar_recordatorios_wa) leyendo el
 * token de WhatsApp guardado en wa_credenciales. Este hook queda como no-op
 * para no duplicar envíos; se conserva la firma por compatibilidad.
 */
export function useRecordatorios() {
  useEffect(() => {
    // Recordatorios gestionados en el backend (cron cada minuto).
  }, [])
}