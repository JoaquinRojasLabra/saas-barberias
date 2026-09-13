import { describe, it, expect, beforeEach } from "vitest"
import { leerRuta, navegarA, esPublica, slugDe, parametrosDe } from "@/lib/router"

describe("router", () => {
  beforeEach(() => {
    window.location.hash = ""
  })

  describe("leerRuta", () => {
    it("devuelve / por defecto cuando no hay hash", () => {
      expect(leerRuta()).toEqual({ path: "/", query: "" })
    })

    it("separa path y query del hash", () => {
      window.location.hash = "#/c/el-cauce?x=1"
      expect(leerRuta()).toEqual({ path: "/c/el-cauce", query: "x=1" })
    })

    it("ignora el # inicial", () => {
      window.location.hash = "#/agenda"
      expect(leerRuta().path).toBe("/agenda")
    })
  })

  describe("navegarA", () => {
    it("setea el hash", () => {
      navegarA("/agenda")
      expect(window.location.hash).toBe("#/agenda")
    })
  })

  describe("esPublica", () => {
    it("reconoce rutas /c/", () => {
      expect(esPublica("/c/el-cauce")).toBe(true)
      expect(esPublica("/c/foo/bar")).toBe(true)
      expect(esPublica("/agenda")).toBe(false)
      expect(esPublica("/")).toBe(false)
    })
  })

  describe("slugDe", () => {
    it("extrae el slug de la ruta pública", () => {
      expect(slugDe("/c/el-cauce")).toBe("el-cauce")
      expect(slugDe("/c/el-cauce/reservar")).toBe("el-cauce")
    })

    it("devuelve '' si no es ruta pública", () => {
      expect(slugDe("/agenda")).toBe("")
      expect(slugDe("/")).toBe("")
    })
  })

  describe("parametrosDe", () => {
    it("parsea query strings", () => {
      expect(parametrosDe("a=1&b=hola")).toEqual({ a: "1", b: "hola" })
      expect(parametrosDe("")).toEqual({})
    })
  })
})
