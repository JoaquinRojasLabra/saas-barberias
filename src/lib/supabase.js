import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn("Supabase: faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY")
}

export const supabase = createClient(url || "https://noop.local", anonKey || "noop")

// Cliente SIN sesión para RPCs que solo admiten usuarios anónimos (p. ej.
// reservar_turno, que rechaza auth.uid() para impedir turnos en negocios ajenos).
// Usa un storage distinto para no heredar la sesión persistida del panel.
export const supabasePublic = createClient(url || "https://noop.local", anonKey || "noop", {
  auth: { persistSession: false, autoRefreshToken: false, storageKey: "sb-anon-reserva" },
})