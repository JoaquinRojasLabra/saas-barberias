# Diseño: Estados de carga, error y contenido vacío

Fecha: 2026-09-13
Proyecto: saas-barberias

## Objetivo

Agregar estados de carga, error y contenido vacío consistentes a todo el
proyecto (panel privado + páginas públicas). Reemplazar los textos sueltos
actuales ("No hay turnos agendados.", "No hay servicios...") por componentes
reutilizables que sigan el tema (variables CSS) y las animaciones del app.

## Alcance

- 7 vistas del panel: Dashboard, Agenda, Ventas, Clientes, QR, Ajustes,
  Personalización (esta última solo carga y error, sin vacío).
- 2 páginas públicas: PublicPage y PublicReserva.
- No cambia lógica de datos ni de store. `cargando`/`error` globales ya existen
  en `store.jsx`; solo se consumen de forma ordenada.

## Arquitectura

Componentes nuevos en `src/components/common/`:

### `Cargando.jsx`
- Spinner SVG con rotación animada en loop (~0.8s, framer-motion, ease linear),
  centrado en el área de contenido.
- Props: `mensaje` (opcional, default `"Cargando…"`).
- Usa tokens del tema (`--accent`, `--fg-muted`). Mismo look en panel y públicas.

### `EstadoError.jsx`
- Icono de advertencia en círculo `--accent`/10, título `"Algo salió mal"`,
  mensaje del error (`--fg-muted`) y botón primario `"Reintentar"`.
- Props: `mensaje`, `onReintentar`.
- Animaciones `whileHover`/`whileTap` en el botón.

### `EstadoVacio.jsx`
- Icono (componente Phosphor pasado como prop) en círculo `--accent`/15,
  título, descripción y CTA opcional (botón primario).
- Props: `icono`, `titulo`, `descripcion`, `cta` (opcional), `onCta` (opcional).

### `useEstadoVista.js`
Hook que imprime el orden estricto de estados y devuelve el nodo a renderizar:

1. `cargando` → `<Cargando />`
2. `error` → `<EstadoError mensaje onReintentar />`
3. `vacio` → `<EstadoVacio ... />`
4. si no pasó ninguna → `null` (contenido normal)

Firma:
```js
const estado = useEstadoVista({
  cargando, error, onReintentar, vacio, icono, titulo, descripcion, cta, onCta,
})
```
Uso por vista: `if (estado) return estado`.

## Aplicación por vista

Carga y error son iguales en todas: `cargando`/`error` del store y reintento con
`cargarTenant(negocioId)`; en públicas el reintento usa `activarPorSlug(slug)`.

### Panel privado

| Vista | Condición vacío | EstadoVacio (icono · título · desc) | CTA |
|---|---|---|---|
| Dashboard | sin ventas ni turnos en todo el historial | `ChartLineUp` · "Sin actividad todavía" · "Registra tu primera venta o turno para ver métricas" | "Ir a ventas" -> `setView("ventas")` |
| Agenda | 0 turnos para hoy | `CalendarBlank` · "Sin turnos para hoy" · "Empieza el día agendando tu primer turno" | "Nuevo turno" -> abre `TurnoModal` |
| Ventas | 0 ventas | `CurrencyDollar` · "Sin ventas todavía" · "Registra la primera venta y llévala a tu historial" | "Registrar venta" -> abre `RegistroVenta` |
| Clientes | 0 clientes (y sin búsqueda) | `UsersThree` · "Aún no tienes clientes" · "Crea tu primer cliente para llevar su ficha y ventas" | "Nuevo cliente" -> abre `ClienteModal` |
| Clientes (búsqueda) | búsqueda sin resultados | `MagnifyingGlass` · "Sin resultados" · "No encontramos clientes para «{q}»" | — |
| QR | sin escaneos registrados | `QrCode` · "Todavía no hay escaneos" · "Los escaneos del QR de tu barbería aparecerán aquí" | — |
| Ajustes · Servicios | 0 servicios | `Scissors` · "No hay servicios" · "Agrega el primero y aparecerá en tu página pública" | "Agregar servicio" -> abre el form |
| Ajustes · Trabajadores | 0 empleados | `UserPlus` · "No hay barberos" · "Suma tu primer barbero para asignarle turnos" | "Agregar barbero" -> abre el form |
| Personalización | (sin lista: solo carga/error) | — | — |

Nota: el Dashboard mantiene sus cards aunque haya 0; el vacío solo se muestra si
no hay NINGUNA actividad (sin ventas Y sin turnos en el historial).

### Páginas públicas

| Vista | Condición vacío | EstadoVacio | CTA |
|---|---|---|---|
| PublicPage | negocio sin servicios publicados | `Scissors` · "Aún no hay servicios" · "Vuelve pronto: la barbería está armando su carta" | — |
| PublicReserva · paso Horario | 0 horas libres | `Clock` · "Sin cupos disponibles" · "Elige otra fecha, hay turnos de sobra" | — (reemplaza el `<p>` suelto) |
| PublicReserva · paso Servicio | negocio sin servicios | `Scissors` · "Próximamente" · "Aún no hay servicios para reservar" | "Volver" -> `navegarA('/c/{slug}')` |

Carga en públicas: PublicPage y PublicReserva muestran `Cargando` mientras
`activarPorSlug` carga (hoy solo se ve fondo vacío).

## Tests

- Ajustar tests existentes por cambio de textos:
  - `agenda.test.jsx` (`"No hay turnos agendados."`).
  - `public-reserva.test.jsx` (texto de "Sin cupos...").
  - revisar `modales.test.jsx` / `ajustes` si assertsan textos de vacío.
- Nuevo `src/test/estados.test.jsx`:
  - `Cargando` muestra spinner y mensaje por defecto.
  - `EstadoError` muestra mensaje y dispara `onReintentar`.
  - `EstadoVacio` muestra icono/título/desc y ejecuta `onCta` (sin botón si no
    viene `cta`).
  - `useEstadoVista`: prioridad cargando > error > vacío > contenido (null).

## Verificación

- `npm test` (26 actuales + nuevos) en verde.
- `npm run build` sin errores.

## Registro

- El cambio se documenta en `C:\Users\juako\Trabajo\docs\CHANGELOG-CODEX.md`.
- Implementación local: `npx vercel --prod` cuando el usuario lo pida.