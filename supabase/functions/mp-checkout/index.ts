// mp-checkout: crea una preferencia de pago en Mercado Pago para una venta.
// Requiere que el negocio tenga credenciales guardadas en mp_credenciales.
// Corrida con service role: lee el access_token del backend, nunca del cliente.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get("SUPABASE_URL")
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  })
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (!supabaseUrl || !serviceKey) return json({ error: "Servidor mal configurado" }, 500)

  try {
    const { negocio_id, venta_id, monto, concepto, return_url } = await req.json()
    if (!negocio_id || !venta_id || !monto || monto <= 0) {
      return json({ error: "Faltan datos para generar el pago" }, 400)
    }

    const supabase = createClient(supabaseUrl, serviceKey)
    const { data: creds } = await supabase
      .from("mp_credenciales")
      .select("negocio_id, mp_access_token, mp_public_key")
      .eq("negocio_id", negocio_id)
      .maybeSingle()

    if (!creds?.mp_access_token) {
      return json({ error: "Este negocio no tiene Mercado Pago configurado aún" }, 400)
    }

    const base = return_url || req.headers.get("origin") || ""

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.mp_access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: concepto || "Servicio",
            quantity: 1,
            unit_price: Number(monto),
            currency_id: "CLP",
          },
        ],
        external_reference: String(venta_id),
        notification_url: `${supabaseUrl}/functions/v1/mp-webhook`,
        back_urls: {
          success: base,
          pending: base,
          failure: base,
        },
        auto_return: "approved",
      }),
    })

    const pref = await mpRes.json()
    if (!mpRes.ok || !pref?.id || !pref?.init_point) {
      return json({ error: "Mercado Pago no pudo crear el pago", detalle: pref?.message }, 502)
    }

    await supabase.from("ventas").update({ mp_preference_id: pref.id }).eq("id", venta_id)

    return json({ init_point: pref.init_point, preference_id: pref.id, external_reference: String(venta_id) })
  } catch (e) {
    return json({ error: e?.message || "Error interno" }, 500)
  }
})