# Estado: Carga, Error y Vacío en la UI

Fecha: 2026-09-13
Spec: `docs/superpowers/specs/2026-09-13-estados-ui-design.md`

## Objetivo

Mostrar estados consistentes de carga, error y contenido vacío en las 7 vistas
del panel (Dashboard, Agenda, Ventas, Clientes, QR, Ajustes, Personalización) y
en las 2 páginas públicas (PublicPage, PublicReserva), con componentes
reutilizables en `src/components/common/`.

Prioridad estricta de estados: `cargando` → `error` → `vacio` → contenido.
El reintento usa `cargarTenant(negocioId)` en el panel y `activarPorSlug(slug)`
en las públicas.

## Verificación

- `npm test` → `vitest run` (26 tests actuales → 31 tras el plan)
- `npm run build` → `vite build`
- `npm run lint` → `oxlint`

## Archivos

### Crear
- `src/components/common/Cargando.jsx`
- `src/components/common/EstadoError.jsx`
- `src/components/common/EstadoVacio.jsx`
- `src/components/common/useEstadoVista.js`
- `src/test/estados.test.jsx`

### Modificar
- `src/components/dashboard/Dashboard.jsx`
- `src/components/agenda/Agenda.jsx`
- `src/components/ventas/Ventas.jsx`
- `src/components/clientes/Clientes.jsx`
- `src/components/qr/QR.jsx`
- `src/components/ajustes/Ajustes.jsx`
- `src/components/personalizacion/Personalizacion.jsx`
- `src/pages/PublicPage.jsx`
- `src/pages/PublicReserva.jsx`
- `src/test/agenda.test.jsx`
- `src/test/dashboard.test.jsx`
- `src/test/public-reserva.test.jsx`

Nota: `error` en el store es siempre un string (`e?.message || "Error al cargar"`,
`"Barbería no encontrada"`), y `cargando` inicia en `true`.

---

## Tarea 1 — Componentes comunes + hook + tests

Commits: `feat: componentes de estado de carga, error y vacío`

### `src/components/common/Cargando.jsx`

```jsx
import { motion } from "framer-motion"

export default function Cargando({ mensaje = "Cargando…" }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-24"
      role="status"
      aria-live="polite"
    >
      <motion.svg
        width="42"
        height="42"
        viewBox="0 0 24 24"
        fill="none"
        role="presentation"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      >
        <circle cx="12" cy="12" r="9" stroke="var(--bg-card)" strokeWidth="3" />
        <path
          d="M12 3a9 9 0 0 1 9 9"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </motion.svg>
      <p className="text-sm font-medium text-[var(--fg-muted)]">{mensaje}</p>
    </div>
  )
}
```

### `src/components/common/EstadoError.jsx`

```jsx
import { motion } from "framer-motion"
import { WarningCircle } from "@phosphor-icons/react"

export default function EstadoError({ mensaje, onReintentar }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
        <WarningCircle size={28} weight="duotone" />
      </span>
      <div className="space-y-1">
        <p className="text-lg font-extrabold tracking-tight">Algo salió mal</p>
        {mensaje && <p className="text-sm text-[var(--fg-muted)]">{mensaje}</p>}
      </div>
      {onReintentar && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReintentar}
          className="mt-1 inline-flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
        >
          Reintentar
        </motion.button>
      )}
    </div>
  )
}
```

### `src/components/common/EstadoVacio.jsx`

```jsx
import { motion } from "framer-motion"

export default function EstadoVacio({ icono: Icono, titulo, descripcion, cta, onCta }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
        {Icono && <Icono size={28} weight="duotone" />}
      </span>
      <div className="space-y-1">
        <p className="text-base font-extrabold tracking-tight">{titulo}</p>
        {descripcion && <p className="text-sm text-[var(--fg-muted)]">{descripcion}</p>}
      </div>
      {cta && onCta && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCta}
          className="mt-2 inline-flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
        >
          {cta}
        </motion.button>
      )}
    </div>
  )
}
```

### `src/components/common/useEstadoVista.js`

```js
import Cargando from "./Cargando"
import EstadoError from "./EstadoError"
import EstadoVacio from "./EstadoVacio"

export default function useEstadoVista({
  cargando,
  error,
  onReintentar,
  vacio,
  icono,
  titulo,
  descripcion,
  cta,
  onCta,
}) {
  if (cargando) return <Cargando />
  if (error) return <EstadoError mensaje={error} onReintentar={onReintentar} />
  if (vacio) return <EstadoVacio icono={icono} titulo={titulo} descripcion={descripcion} cta={cta} onCta={onCta} />
  return null
}
```

Uso por vista (reemplaza la vista completa):
```js
const estado = useEstadoVista({ cargando, error, onReintentar, /* vacio, icono, titulo, descripcion, cta, onCta */ })
if (estado) return estado
```

### `src/test/estados.test.jsx`

```jsx
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Users } from "@phosphor-icons/react"
import { useState } from "react"
import Cargando from "@/components/common/Cargando"
import EstadoError from "@/components/common/EstadoError"
import EstadoVacio from "@/components/common/EstadoVacio"
import useEstadoVista from "@/components/common/useEstadoVista"

function Probe({ estado }) {
  const [props] = useState(() => ({ ...estado }))
  const node = useEstadoVista(props)
  return <div>{node}</div>
}

describe("Cargando", () => {
  it("muestra el spinner, mensaje por defecto y role=status", () => {
    render(<Cargando />)
    expect(screen.getByText("Cargando…")).toBeInTheDocument()
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("usa el mensaje custom", () => {
    render(<Cargando mensaje="Cargando la barbería…" />)
    expect(screen.getByText("Cargando la barbería…")).toBeInTheDocument()
  })
})

describe("EstadoError", () => {
  it("muestra título + mensaje y dispara Reintentar", () => {
    const onReintentar = vi.fn()
    render(<EstadoError mensaje="Barbería no encontrada" onReintentar={onReintentar} />)
    expect(screen.getByText("Algo salió mal")).toBeInTheDocument()
    expect(screen.getByText("Barbería no encontrada")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }))
    expect(onReintentar).toHaveBeenCalledTimes(1)
  })

  it("no muestra botón si no hay onReintentar", () => {
    render(<EstadoError mensaje="ups" />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })
})

describe("EstadoVacio", () => {
  it("muestra icono, título, descripción y ejecuta el CTA", () => {
    const onCta = vi.fn()
    render(
      <EstadoVacio
        icono={Users}
        titulo="Sin turnos para hoy"
        descripcion="Empieza el día agendando tu primer turno"
        cta="Nuevo turno"
        onCta={onCta}
      />
    )
    expect(screen.getByText("Sin turnos para hoy")).toBeInTheDocument()
    expect(screen.getByText("Empieza el día agendando tu primer turno")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Nuevo turno/i }))
    expect(onCta).toHaveBeenCalledTimes(1)
  })

  it("no muestra botón si no hay cta", () => {
    render(<EstadoVacio icono={Users} titulo="Sin resultados" />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })
})

describe("useEstadoVista", () => {
  it("prioriza cargando > error > vacío > null", () => {
    const { rerender } = render(
      <Probe estado={{ cargando: true, error: "Algo falló", vacio: true }} />
    )
    expect(screen.getByText("Cargando…")).toBeInTheDocument()

    rerender(
      <Probe estado={{ cargando: false, error: "Algo falló", vacio: true, onReintentar: vi.fn() }} />
    )
    expect(screen.getByText("Algo salió mal")).toBeInTheDocument()

    rerender(
      <Probe estado={{ cargando: false, error: null, vacio: true, icono: Users, titulo: "Vacío" }} />
    )
    expect(screen.getByText("Vacío")).toBeInTheDocument()

    rerender(<Probe estado={{ cargando: false, error: null, vacio: false }} />)
    expect(screen.queryByText("Cargando…")).not.toBeInTheDocument()
    expect(screen.queryByText("Vacío")).not.toBeInTheDocument()
  })
})
```

**Verificación Tarea 1:** `npm test -- estados` en verde.

---

## Tarea 2 — Dashboard: carga/error global + vacío inline en el historial

Commit: `feat: estados de carga, error y vacío en Dashboard`

Los mocks de `dashboard.test.jsx` no tienen `cargando`, `error`, `setView` ni
`cargarTenant` → los destructures nuevos dan `undefined` (falsy): el hook
devuelve `null` y el CTA "Ir a ventas" nunca se dispara en los tests.

Cambios en `src/components/dashboard/Dashboard.jsx`:

1. Import:
   - Añadir `ChartLineUp` a los iconos de `@phosphor-icons/react`.
   - `import EstadoVacio from "@/components/common/EstadoVacio"`
   - `import useEstadoVista from "@/components/common/useEstadoVista"`

2. Destructure de `useStore` — añadir `cargando, error, cargarTenant, negocioId, setView`.

3. Justo después del `const barberoNombre = ...` y antes del `return`:

```js
const estado = useEstadoVista({ cargando, error, onReintentar: () => cargarTenant(negocioId) })
if (estado) return estado

const sinActividad = turnos.length === 0 && ventas.length === 0
```

4. El bloque inferior (Proveedor del `ProgressRing` + SalesChart, hoy las líneas
   77-84) se envuelve:

```jsx
{sinActividad ? (
  <div className="lg:col-span-3">
    <EstadoVacio
      icono={ChartLineUp}
      titulo="Sin actividad todavía"
      descripcion="Registra tu primera venta o turno para ver métricas aquí"
      cta="Ir a ventas"
      onCta={() => setView("ventas")}
    />
  </div>
) : (
  <>
    {/* ProgressRing + SalesChart exactamente como hoy */}
  </>
)}
```

Las tarjetas de métricas (greeting + cards) se muestran siempre.

5. `src/test/dashboard.test.jsx` — añadir test:

```jsx
it("muestra el estado vacío cuando no hay ningún registro", () => {
  mocks.scope.turnos = []
  mocks.scope.ventas = []
  render(<Dashboard />)
  expect(screen.getByText("Sin actividad todavía")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: /Ir a ventas/i }))
  expect(mocks.setView).toHaveBeenCalledWith("ventas")
})
```

Y en la definición de `mocks` añadir `setView: vi.fn()` para respaldar ese assert.

**Verificación Tarea 2:** `npm test -- dashboard` en verde.

---

## Tarea 3 — Agenda: vacío a vista completa

Commit: `feat: estado vacío de turnos en Agenda`

Cambios en `src/components/agenda/Agenda.jsx`:

1. Import:
   - Añadir `CalendarBlank` a los iconos.
   - `import useEstadoVista from "@/components/common/useEstadoVista"`

2. Destructure de `useStore` — añadir `cargando, error, cargarTenant, negocioId`.

3. Tras el `const ordenados = ...` (y su condicional), antes del `return`:

```js
const estado = useEstadoVista({
  cargando,
  error,
  onReintentar: () => cargarTenant(negocioId),
  vacio: ordenados.length === 0,
  icono: CalendarBlank,
  titulo: "Sin turnos para hoy",
  descripcion: "Empieza el día agendando tu primer turno",
  cta: "Nuevo turno",
  onCta: () => setShowModal(true),
})
if (estado) return estado
```

Nota: el botón "Nuevo turno" del header desaparece en el estado vacío; el CTA del
estado vacío cumple esa función (mismo `setShowModal(true)` → `TurnoModal` con
`empleadoPorDefecto`).

4. Eliminar la línea 31 con `<p className="...">No hay turnos agendados.</p>` del
   bloque de la lista (la lista solo se renderiza cuando hay turnos).

5. `src/test/agenda.test.jsx` línea 52 — cambiar el texto esperado:

```jsx
expect(screen.getByText("Sin turnos para hoy")).toBeInTheDocument()
```

**Verificación Tarea 3:** `npm test -- agenda` en verde.

---

## Tarea 4 — Ventas: vacío a vista completa

Commit: `feat: estado vacío de ventas en la vista Ventas`

Cambios en `src/components/ventas/Ventas.jsx`:

1. Import:
   - Añadir `CurrencyDollar` a los iconos.
   - `import useEstadoVista from "@/components/common/useEstadoVista"`

2. Destructure de `useStore` — añadir `cargando, error, cargarTenant, negocioId`.

3. Tras el `const totalHoy = ...`, antes del `return`:

```js
const estado = useEstadoVista({
  cargando,
  error,
  onReintentar: () => cargarTenant(negocioId),
  vacio: ordenadas.length === 0,
  icono: CurrencyDollar,
  titulo: "Sin ventas todavía",
  descripcion: "Registra la primera venta y llévala a tu historial",
  cta: "Registrar venta",
  onCta: () => setShowModal(true),
})
if (estado) return estado
```

4. Eliminar la línea ~77 con `<p>No hay ventas registradas.</p>` (la lista solo
   se renderiza cuando hay ventas).

**Verificación Tarea 4:** `npm test` global (la suite de ventas/mocks no asserta
ese texto).

---

## Tarea 5 — Clientes: vacío total a vista completa + búsqueda sin resultados

Commit: `feat: estados vacíos de clientes (sin clientes y sin resultados)`

Cambios en `src/components/clientes/Clientes.jsx`:

1. Import:
   - Añadir `UsersThree` a los iconos; quitar `UserMinus` (dejó de usarse).
   - `import EstadoVacio from "@/components/common/EstadoVacio"`
   - `import useEstadoVista from "@/components/common/useEstadoVista"`

2. Destructure de `useStore` — añadir `cargando, error, cargarTenant, negocioId`.

3. Tras el `const ordenados = ...`, antes del `return`:

```js
const estado = useEstadoVista({
  cargando,
  error,
  onReintentar: () => cargarTenant(negocioId),
  vacio: clientes.length === 0,
  icono: UsersThree,
  titulo: "Aún no tienes clientes",
  descripcion: "Crea tu primer cliente para llevar su ficha, turnos y ventas",
  cta: "Nuevo cliente",
  onCta: () => setModal("nuevo"),
})
if (estado) return estado
```

Nota: con cero clientes se ocultan también la barra de búsqueda y el botón del
header; el CTA del estado vacío abre el mismo formulario (`setModal("nuevo")`).

4. El bloque de "sin resultados de búsqueda" (hoy un `motion.p` con `UserMinus`,
   líneas ~91-96) se reemplaza por:

```jsx
{ordenados.length === 0 && (
  <EstadoVacio
    icono={MagnifyingGlass}
    titulo="Sin resultados"
    descripcion={`No encontramos clientes para «${q}»`}
  />
)}
```

`MagnifyingGlass` ya está importado. El header y la búsqueda se conservan en este
caso (hay clientes, solo el filtro no coincide).

**Verificación Tarea 5:** `npm test` global + `npm run lint` (import limpio).

---

## Tarea 6 — QR: carga/error global + vacío inline de escaneos

Commit: `feat: estados de carga, error y vacío en QR`

La card del QR nunca se reemplaza; solo los stats.

Cambios en `src/components/qr/QR.jsx`:

1. Import:
   - `import EstadoVacio from "@/components/common/EstadoVacio"`
   - `import useEstadoVista from "@/components/common/useEstadoVista"`
   - `QrCode` ya está importado.

2. Destructure de `useStore` — añadir `cargando, error, cargarTenant, negocioId`.

3. Tras el `const estaSemana = ...`, antes del `return`:

```js
const estado = useEstadoVista({ cargando, error, onReintentar: () => cargarTenant(negocioId) })
if (estado) return estado
```

4. El bloque de stats de esta semana (hoy líneas ~42-57) se envuelve:

```jsx
{qrStats.length === 0 ? (
  <div className="w-full max-w-xs">
    <EstadoVacio
      icono={QrCode}
      titulo="Todavía no hay escaneos"
      descripcion="Los escaneos del QR de tu barbería aparecerán aquí"
    />
  </div>
) : (
  <div className="w-full max-w-xs space-y-2">{/* stats originales */}</div>
)}
```

**Verificación Tarea 6:** `npm test` global (no hay test de QR) + `npm run build`.

---

## Tarea 7 — Ajustes: carga/error global + vacíos inline de Servicios y Trabajadores

Commit: `feat: estados vacíos de servicios y trabajadores en Ajustes`

Cambios en `src/components/ajustes/Ajustes.jsx`:

1. Import:
   - `import { useState, useRef } from "react"` (añadir `useRef`).
   - Añadir `UserPlus` a los iconos (junto a `Scissors` que ya está).
   - `import EstadoVacio from "@/components/common/EstadoVacio"`
   - `import useEstadoVista from "@/components/common/useEstadoVista"`

2. En `Ajustes`:
   - Destructure de `useStore` — añadir `cargando, error, cargarTenant, negocioId`.
   - `const nombreServicioRef = useRef(null)`
   - Tras las consts `input`/`label` (~líneas 171-172) y antes del `if (esBarbero)`:

```js
const estadoGlobal = useEstadoVista({ cargando, error, onReintentar: () => cargarTenant(negocioId) })
if (estadoGlobal) return estadoGlobal
```

   - Añadir `ref={nombreServicioRef}` al `<input>` de nombre de servicio en el
     formulario (también con `value={servicioForm.nombre}`).
   - Reemplazar la línea ~595:

```jsx
{(servicios?.length || 0) === 0 && (
  <EstadoVacio
    icono={Scissors}
    titulo="No hay servicios"
    descripcion="Agrega el primero y aparecerá en tu página pública"
    cta="Agregar servicio"
    onCta={() => nombreServicioRef.current?.focus()}
  />
)}
```

   Nota: se reemplaza el texto vacío actual "No hay servicios. Agrega el primero
   arriba."

3. En `Trabajadores`:
   - `const nombreRef = useRef(null)`
   - Añadir `ref={nombreRef}` al `<input>` de nombre del trabajador.
   - Reemplazar la línea ~685:

```jsx
{empleados.length === 0 && (
  <EstadoVacio
    icono={UserPlus}
    titulo="No hay barberos"
    descripcion="Suma tu primer barbero para asignarle turnos"
    cta="Agregar barbero"
    onCta={() => nombreRef.current?.focus()}
  />
)}
```

   Nota: se reemplaza el texto actual "Aún no agregas trabajadores."

Ambos formularios (Servicios y Trabajadores) quedan visibles arriba:
`Agregar servicio/barbero` enfoca su input.

**Verificación Tarea 7:** `npm test` global + `npm run build`.

---

## Tarea 8 — Personalización: solo carga/error

Commit: `feat: estados de carga y error en Personalización`

No hay estado vacío; las pestañas quedan intactas.

Cambios en `src/components/personalizacion/Personalizacion.jsx`:

1. Import: `import useEstadoVista from "@/components/common/useEstadoVista"`
2. Destructure de `useStore` — añadir `cargando, error, cargarTenant, negocioId`.
3. Tras las consts `guardar`/`reiniciarEstilo`, antes del `return`:

```js
const estado = useEstadoVista({ cargando, error, onReintentar: () => cargarTenant(negocioId) })
if (estado) return estado
```

**Verificación Tarea 8:** `npm test` global + `npm run build`.

---

## Tarea 9 — PublicPage: carga/error global + vacío inline de servicios

Commit: `feat: estados de carga, error y vacío en la página pública`

Cambios en `src/pages/PublicPage.jsx`:

1. Import:
   - `import EstadoVacio from "@/components/common/EstadoVacio"`
   - `import useEstadoVista from "@/components/common/useEstadoVista"`
   - `Scissors` y `Background` ya están importados.

2. Destructure de `useStore` — añadir `cargando`.

3. El bloque `if (!negocio && error) { ... }` (hoy líneas ~40-56, la pantalla
   "Barbería no encontrada" con `navegarA("/")`) se **reemplaza** por:

```js
const estado = useEstadoVista({ cargando, error, onReintentar: () => activarPorSlug(slug) })
if (estado) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <Background />
      {estado}
    </div>
  )
}
```

   Nota: según la spec, en públicas el reintento usa `activarPorSlug(slug)`. Esto
   sustituye la pantalla dedicada "Barbería no encontrada" por el `EstadoError`
   genérico con Reintentar. `navegarA` sigue usándose más abajo.

4. En la sección de servicios (hoy líneas ~94-122), el contenedor de la grilla
   se envuelve:

```jsx
{servicios.length === 0 ? (
  <EstadoVacio
    icono={Scissors}
    titulo="Aún no hay servicios"
    descripcion="Vuelve pronto: la barbería está armando su carta"
  />
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{/* grilla original */}</div>
)}
```

**Verificación Tarea 9:** `npm test -- publicpage` en verde (los mocks devuelven
`error: null` y no definen `cargando` → el hook devuelve `null` y no se borra nada).

---

## Tarea 10 — PublicReserva: carga/error global + vacíos en Horario y Servicios

Commit: `feat: estados vacíos en el reserva pública`

Cambios en `src/pages/PublicReserva.jsx`:

1. Import:
   - `import EstadoVacio from "@/components/common/EstadoVacio"`
   - `import useEstadoVista from "@/components/common/useEstadoVista"`
   - `Clock`, `Scissors`, `Background`, `navegarA` ya están importados.

2. Destructure de `useStore` — añadir `cargando, error`.

3. Tras el último `useEffect` (~línea 111), antes del bloque de consts derivadas:

```js
const estado = useEstadoVista({ cargando, error, onReintentar: () => activarPorSlug(slugActual) })
if (estado) {
  return (
    <div className="min-h-screen px-6 py-8 relative">
      <Background />
      {estado}
    </div>
  )
}
```

4. Paso 0 (elegir servicio), el `{servicios.map(...)}` se envuelve:

```jsx
{servicios.length === 0 ? (
  <EstadoVacio
    icono={Scissors}
    titulo="Próximamente"
    descripcion="Aún no hay servicios para reservar"
    cta="Volver"
    onCta={() => navegarA(`/c/${slugActual}`)}
  />
) : (
  <div className="space-y-2">{servicios.map(...)}</div>
)}
```

5. Paso 1 (elegir hora), el `<p>Sin cupos para esa fecha. Elige otra.</p>` se
   reemplaza por:

```jsx
<EstadoVacio
  icono={Clock}
  titulo="Sin cupos disponibles"
  descripcion="Elige otra fecha, hay turnos de sobra"
/>
```

Nota: el `Metodo` del cliente (texto del picker) se mantiene encima tal cual.

6. `src/test/public-reserva.test.jsx` — añadir dos tests:

```jsx
it("paso 1: muestra 'Sin cupos disponibles' cuando no quedan horas", async () => {
  mocks.horariosOcupados.mockResolvedValue(["10:00", "10:30", "11:00", "11:30"])
  render(<PublicReserva slug="el-cauce" />)
  fireEvent.click(screen.getByText("Corte"))
  fireEvent.click(screen.getByRole("button", { name: /Continuar/i }))
  fireEvent.click(screen.getByText("Carlos"))
  await vi.waitFor(() => {
    expect(screen.getByText("Sin cupos disponibles")).toBeInTheDocument()
  })
})

it("paso 0: muestra 'Próximamente' cuando el negocio no tiene servicios", () => {
  const antes = mocks.servicios
  mocks.servicios = []
  render(<PublicReserva slug="el-cauce" />)
  expect(screen.getByText("Próximamente")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "Volver" }))
  expect(mocks.navegarA).toHaveBeenCalledWith("/c/el-cauce")
  mocks.servicios = antes
})
```

> En el test del paso 0 se usa `{ name: "Volver" }` (exacto) para no colisionar
> con el botón "Volver a la barbería" del header.

**Verificación Tarea 10:** `npm test -- public-reserva` en verde.

---

## Tarea 11 — Verificación global y CHANGELOG

Commit: `docs: actualizar CHANGELOG por estados de UI`

- `npm test` → 31 tests en verde.
- `npm run build` → OK.
- `npm run lint` → OK.
- Actualizar `C:\Users\juako\Trabajo\docs\CHANGELOG-CODEX.md` con la feature
  (estados de carga, error y vacío).
```