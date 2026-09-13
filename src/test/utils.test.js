import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("utils", () => {
  describe("cn", () => {
    it("une clases truthy con espacio", () => {
      expect(cn("a", "b", "c")).toBe("a b c")
    })

    it("filtra falsy", () => {
      expect(cn("a", "", null, undefined, false, "b")).toBe("a b")
    })

    it("devuelve cadena vacía sin argumentos útiles", () => {
      expect(cn()).toBe("")
      expect(cn(null, undefined, false)).toBe("")
    })
  })
})
