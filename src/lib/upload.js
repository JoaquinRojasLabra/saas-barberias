import { supabase } from "@/lib/supabase"

const BUCKET = "negocio-imagenes"

export async function subirImagen(file, uid, carpeta = "fotos") {
  if (!file) throw new Error("Sin archivo")
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
  const nombre = `${uid}/${carpeta}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(nombre, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(nombre)
  return data.publicUrl
}