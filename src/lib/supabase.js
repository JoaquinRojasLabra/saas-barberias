import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn("Supabase: faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY")
}

export const supabase = createClient(url || "https://noop.local", anonKey || "noop")