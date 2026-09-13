import { describe, it, expect } from "vitest"
import { formatCLP, formatHora, hoyKey } from "@/lib/format"

describe("format", () => {
  describe("formatCLP", () => {
    it("formatea montos en pesos chilenos sin decimales", () => {
      expect(formatCLP(12000)).toMatch(/12\.000/)
      expect(formatCLP(0)).toMatch(/0/)
    })

    it("formatea números negativos", () => {
      expect(formatCLP(-500)).toMatch(/-/)
    })
  })

  describe("formatHora", () => {
    it("devuelve -- para fechas inválidas", () => {
      expect(formatHora("no-es-fecha")).toBe("--")
      expect(formatHora("")).toBe("--")
      expect(formatHora(undefined)).toBe("--")
    })

    it("formatea una fecha ISO válida", () => {
      const out = formatHora("2026-08-11T09:05:00")
      expect(out).toMatch(/^09:05/)
    })
  })

  describe("hoyKey", () => {
    it("genera clave YYYY-MM-DD con cero a la izquierda", () => {
      expect(hoyKey(new Date(2026, 0, 5))).toBe("2026-01-05")
      expect(hoyKey(new Date(2026, 11, 31))).toBe("2026-12-31")
    })

    it("usa la fecha actual por defecto", () => {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, "0")
      const d = String(now.getDate()).padStart(2, "0")
      expect(hoyKey()).toBe(`${y}-${m}-${d}`)
    })
  })
})
