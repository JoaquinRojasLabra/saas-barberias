# E2E en producción — Hallazgos (2026-08-11)

Sesión E2E real contra https://saas-barberias-tau.vercel.app usando Playwright.
Credenciales demo: `demo@barberia.app` / `barberia123` (dueño);
`sebastian@barberia.app` / `barberia123` (barbero).

## Bugs confirmados

### BUG-1 (crítico): Reserva con "En la barbería" falla con 23502
- **Síntoma**: al reservar eligiendo el método "En la barbería"
  (`p_metodo_pago = null`), la RPC `reservar_turno` falla:
  `null value in column "pagado" of relation "turnos"` (SQLSTATE 23502).
  El front muestra el error en un toast pero no crea la reserva.
- **Causa raíz**: `supabase/migrations/20260809_01_rpc_validacion.sql`.
  ```
  v_pendiente := p_metodo_pago in ('Transferencia','Mercado Pago');
  ...
  not v_pendiente  -- con p_metodo_pago = NULL => v_pendiente = NULL => not NULL = NULL
  ```
  Con lógica de 3 valores de SQL, `NULL in (...)` da `NULL` y `not NULL` da
  `NULL`, que viola `turnos.pagado NOT NULL`.
- **Fix**: `v_pendiente := coalesce(p_metodo_pago in ('Transferencia','Mercado Pago'), false)`.
- **Flujo que sí funciona**: "Transferencia" crea el turno y una venta pendiente.

### BUG-2 (negocio): Dashboard "Ventas hoy" no filtra ventas pendientes
- **Síntoma**: una reserva E2E con Transferencia, recién creada y SIN pagar,
  apareció en Dashboard "Ventas hoy / Total hoy" ($12.000) junto a las ya
  pagadas. Solo al hacer clic en "Confirmar pago" se mantuvo el total (ya
  pagada) — es decir, el total siempre cuenta, incluso pendientes.
- **Confirmado en Ventas**: la venta figuraba sin badge "Pendiente de pago"
  (Transferencia) pero la de MP sí lo tenía. La suma "Total hoy" incluye todas.

### BUG-3 (UI/permisos): el barbero ve "Mi QR" y "Personalización"
- **Síntoma**: al entrar como `sebastian@barberia.app`, el Sidebar muestra
  "Mi QR" y "Personalización" además de lo propio del barbero. En
  Personalización el barbero ve y puede editar identidad del negocio
  (nombre, dirección, horario, teléfono).
- **Defensa en BD sí existe**: RLS `negocios_update_propio` exige
  `usuario_auth = auth.uid()`, así que el update del barbero se descarta en
  la BD. La exposición es solo de UI (~confuso), y `updateNegocio` no reporta
  el error.
- **Fuente**: `src/components/Sidebar.jsx:17-18` marca `qr` y
  `personalizacion` con `barbero: true`.

## Flujos que funcionan
- Página pública `/c/el-cauce` (slots, servicios, equipo, galería).
- Reserva con método "Transferencia" (turno + venta pendiente).
- Login dueño y barbero.
- Dashboard, Agenda (turno E2E visible), Ventas ("Registrar venta", modal con
  métodos solo activos), "Confirmar pago" (marca pagado), Mi QR (con escaneos),
  Clientes (listado + búsqueda), Agenda del barbero con "Cumplido"/"No llegó",
  Ajustes para barbero = "Mi perfil" correcto.
- 'Cumplido' sobre el turno de prueba: OK.

## Datos de prueba creados en prod (requieren limpieza si aplica)
- Turno + venta: "Cliente E2E Test", +569 9999 8877, Corte clásico $12.000,
  2026-08-11 16:00, Sebastián, Transferencia. Luego "Confirmar pago" y
  "Cumplido" en la Agenda.