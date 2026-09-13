// Los recordatorios por WhatsApp ahora los envía el servidor (pg_cron + pg_net)
// leyendo el token guardado en wa_credenciales. Este módulo solo construye el
// link wa.me que usa el panel para chatear con un cliente.
export function crearLinkWhatsApp(numero, texto) {
  return `https://wa.me/${(numero || "").replace(/\D/g, "")}?text=${encodeURIComponent(texto || "")}`
}