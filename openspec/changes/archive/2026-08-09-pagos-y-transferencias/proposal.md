# Pagos: Mercado Pago, transferencia y métodos configurados

## Problem

La reserva pública ofrece "En línea" que genera un link de pago falso
(`https://mp.la/...`) sin checkout real de Mercado Pago, y los métodos de pago
están hardcodeados en front y panel. Se necesita:

- Que el dueño active/desactive los métodos que acepta (Efectivo, Transferencia,
  Mercado Pago).
- Que cada barbero cargue sus propios datos de transferencia y, al reservar con
  un barbero pagando por transferencia, se muestren los datos de ESE barbero.
- Dejar la integración de Mercado Pago lista para que cada negocio pegue sus
  credenciales (public key + access token) y el cobro real funcione, sin exponer
  el token en el navegador.

## Success

- Ajustes tiene "Métodos de pago" con 3 interruptores y los formularios
  correspondientes (datos de transferencia del negocio; credenciales de MP).
- Cada barbero edita sus datos de transferencia en "Mi perfil".
- La reserva pública solo muestra los métodos activos; al elegir "Transferencia"
  se muestran los datos de transferencia del barbero elegido (o del negocio si no
  se elige barbero); "Mercado Pago" queda desactivado si el negocio no configuró
  credenciales.
- Se elimina el link `mp.la` falso. `generarLinkPago` llama a la edge function
  `mp_checkout` cuando el negocio tiene credenciales y marca el pago como pagado
  vía webhook.

## Non-goals

- No se integra WhatsApp Cloud API real (sigue en modo demo).
- No se soporta "Tarjeta" como método propio: se trata como pago presencial.
- No se hace una pasarela distinta de Mercado Pago.

## Implementation

- Supabase: columnas en `preferencias` (pago_efectivo, pago_transferencia,
  pago_mp, transferencias_*) y en `empleados` (transferencias_*); tabla nueva
  `mp_credenciales` con RLS solo dueño; edge functions `mp_checkout` y
  `mp_webhook`.
- Front: `store.jsx` (cargar métodos/credenciales, `generarLinkPago` real vía
  `supabase.functions.invoke`, filtro de métodos), `PublicReserva.jsx` (tarjeta
  de transferencia + método MP desactivado sin credenciales), `Ajustes.jsx`
  (sección "Métodos de pago" del dueño), perfil de barbero (datos de
  transferencia), `RegistroVenta.jsx` y `Ventas.jsx` (métodos activos).