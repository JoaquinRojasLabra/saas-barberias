const MODO = import.meta.env?.VITE_WHATSAPP_MODO || "demo"

async function demoEnvio(payload) {
  console.log("[whatsapp-demo]", payload)
  return { ok: true, id: `demo-${Date.now()}` }
}

async function realEnvio({ to, language, variables }) {
  const token = import.meta.env?.VITE_WHATSAPP_TOKEN
  const phoneId = import.meta.env?.VITE_WHATSAPP_PHONE_ID
  if (!token || !phoneId) throw new Error("Faltan credenciales de WhatsApp (VITE_WHATSAPP_TOKEN / VITE_WHATSAPP_PHONE_ID)")
  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: "recordatorio_cita",
        language: { code: language || "es" },
        components: variables?.length
          ? [{ type: "body", parameters: variables.map((v) => ({ type: "text", text: String(v) })) }]
          : [],
      },
    }),
  })
  if (!res.ok) throw new Error(`WhatsApp API ${res.status}`)
  return res.json()
}

export function enviarRecordatorio({ to, destinatario, fecha, hora, nombreNegocio, language, variables }) {
  const payload = { to, destinatario, fecha, hora, nombreNegocio, variables }
  return MODO === "real"
    ? realEnvio({ to, language, variables })
    : demoEnvio(payload)
}

export function crearLinkWhatsApp(numero, texto) {
  return `https://wa.me/${(numero || "").replace(/\D/g, "")}?text=${encodeURIComponent(texto || "")}`
}