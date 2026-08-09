// scripts/seed-auth.mjs — creación de usuarios demo en Supabase Auth (service role)
import { createClient } from "@supabase/supabase-js"

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) throw new Error("Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY")

const sb = createClient(url, serviceKey, { auth: { persistSession: false } })

async function upsertUser(email, password) {
  const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const found = list.users.find((u) => u.email === email)
  if (found) return found.id
  const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) throw error
  return data.user.id
}

async function main() {
  const demoId = await upsertUser("demo@barberia.app", "barberia123")
  const sebastianId = await upsertUser("sebastian@barberia.app", "barberia123")
  const mauricioId = await upsertUser("mauricio@barberia.app", "barberia123")
  console.log("SEED_IDS JSON: ", JSON.stringify({ demoId, sebastianId, mauricioId }))
}

main().catch((e) => { console.error(e); process.exit(1) })