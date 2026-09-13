import { describe, it, expect } from "vitest"
import { filaAFront, frontAFila, mapaDe } from "@/lib/mapos"

describe("mapos", () => {
  describe("filaAFront", () => {
    it("convierte snake_case a camelCase", () => {
      const out = filaAFront({ negocio_id: 1, hora_apertura: "09:00", nombre: "El Cauce" })
      expect(out).toEqual({ negocioId: 1, horaApertura: "09:00", nombre: "El Cauce" })
    })

    it("devuelve null si no hay fila", () => {
      expect(filaAFront(null)).toBeNull()
      expect(filaAFront(undefined)).toBeNull()
    })
  })

  describe("frontAFila", () => {
    it("convierte camelCase a snake_case", () => {
      const out = frontAFila("ventas", { negocioId: 1, horaApertura: "09:00" })
      expect(out).toEqual({ negocio_id: 1, hora_apertura: "09:00" })
    })

    it("omite valores undefined y null", () => {
      const out = frontAFila("x", { a: 1, b: undefined, c: null, d: "" })
      expect(out).toEqual({ a: 1, d: "" })
    })

    it("deja claves ya snake_case sin tocarlas", () => {
      const out = frontAFila("x", { negocio_id: 2 })
      expect(out).toEqual({ negocio_id: 2 })
    })
  })

  describe("mapaDe", () => {
    it("mapea una lista de filas", () => {
      const out = mapaDe([{ servicio_id: 1 }, { servicio_id: 2 }])
      expect(out).toEqual([{ servicioId: 1 }, { servicioId: 2 }])
    })

    it("devuelve [] si no hay filas", () => {
      expect(mapaDe(null)).toEqual([])
      expect(mapaDe(undefined)).toEqual([])
    })
  })
})
