import { describe, it, expect } from "vitest"
import { crearLinkWhatsApp } from "@/lib/whatsapp"

describe("whatsapp", () => {
  describe("crearLinkWhatsApp", () => {
    it("construye link wa.me con número saneado", () => {
      expect(crearLinkWhatsApp("+569 1234 5678", "Hola")).toBe(
        "https://wa.me/56912345678?text=Hola"
      )
    })

    it("codifica el texto", () => {
      const link = crearLinkWhatsApp("56912345678", "Hola mundo, ¿todo bien?")
      expect(link).toContain("Hola%20mundo%2C%20%C2%BFtodo%20bien%3F")
    })

    it("tolera números y textos vacíos", () => {
      expect(crearLinkWhatsApp("", "")).toBe("https://wa.me/?text=")
      expect(crearLinkWhatsApp(undefined, undefined)).toBe("https://wa.me/?text=")
    })
  })
})
