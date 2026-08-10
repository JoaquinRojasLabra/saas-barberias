// mp-webhook: notificación de Mercado Pago de pagos.
// Verifica el estado del pago y marca la venta/turno como pagados.
//
// Multi-tenant: el webhook solo sabe el payment_id. Buscamos la credencial del
// negocio correcto probando GET /v1/payments/{id} con cada access_token guardado
// (el que responde 200 es el vendedor de ese pago).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get("SUPABASE_URL")
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

Deno.serve(async (req) => {
  if (!supabaseUrl || !serviceKey) return new Response("Servidor mal configurado", { status: 500 })

  try {
    const { type, data } = await req.json()
    const paymentId = data?.id
    if (type !== "payment" || !paymentId) {
      return new Response("ignored", { status: 200 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)
    const { data: creds } = await supabase.from("mp_credenciales").select("negocio_id, mp_access_token")
    if (!creds?.length) return new Response("sin credenciales", { status: 200 })

    for (const c of creds) {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${c.mp_access_token}` },
      })
      if (!res.ok) continue // este token no es del vendedor de ese pago
      const pago = await res.json()
      if (pago?.status === "approved" && pago?.external_reference) {
        const { data: venta } = await supabase
          .from("ventas")
          .select("turno_id")
          .eq("id", pago.external_reference)
          .eq("negocio_id", c.negocio_id)
          .maybeSingle()
        await supabase.from("ventas").update({ pagado: true, pendiente_pago: false }).eq("id", pago.external_reference)
        if (venta?.turno_id) {
          await supabase.from("turnos").update({ pagado: true }).eq("id", venta.turno_id)
        }
        return new Response("ok", { status: 200 })
      }
      if (pago?.status === "rejected" || pago?.status === "cancelled") {
        return new Response("ok", { status: 200 })
      }
    }
    return new Response("pago no encontrado", { status: 200 })
  } catch (e) {
    return new Response(e?.message || "error", { status: 200 })
  }
})