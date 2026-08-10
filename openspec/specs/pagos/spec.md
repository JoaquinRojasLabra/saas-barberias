# pagos Specification

## Purpose
TBD - created by archiving change 2026-08-09-pagos-y-transferencias. Update Purpose after archive.
## Requirements
### Requirement: Métodos de pago configurados por el dueño

El dueño SHALL poder activar/desactivar los métodos de pago que acepta su
barbería: Efectivo, Transferencia y Mercado Pago. Solo los métodos activos se
ofrecen al cliente en la reserva pública y en el registro de venta.

#### Scenario: Activar y desactivar métodos

- **Given** un dueño autenticado en Ajustes → Métodos de pago
- **When** desactiva Transferencia y guarda
- **Then** Transferencia no aparece al reservar ni al registrar una venta
- **And** el cambio persiste al recargar

#### Scenario: Efectivo siempre disponible

- **When** el dueño desactiva todos los métodos excepto Efectivo
- **Then** el cliente solo ve la opción "En la barbería"
- **And** la reserva sigue funcionando como antes

### Requirement: Datos de transferencia del negocio y del barbero

SHALL existir campos de transferencia (banco, tipo de cuenta, número de cuenta,
RUT y titular) tanto a nivel negocio como a nivel barbero. El barbero SHALL
poder editar los propios desde su perfil; el dueño edita los del negocio desde
Ajustes.

#### Scenario: Datos del negocio

- **Given** Transferencia actica en Ajustes
- **When** el dueño carga banco, tipo, número, RUT y titular del negocio
- **Then** se guardan con la configuración
- **And** si el cliente reserva sin elegir barbero, se muestran esos datos

#### Scenario: Datos del barbero

- **Given** un barbero autenticado con rol barbero
- **When** en "Mi perfil" carga sus datos de transferencia
- **Then** se guardan solo los suyos
- **And** si el cliente reserva con ese barbero y elige Transferencia, se
  muestran los datos de ESE barbero

### Requirement: Mercado Pago configurable por negocio

La integración de Mercado Pago SHALL quedar lista para que el dueño pegue sus
credenciales (Public Key y Access Token), que se guardan cifradas en el backend
y NUNCA llegan al navegador. Mientras el negocio no tenga credenciales, la
opción "Mercado Pago" no se muestra como pagable.

#### Scenario: Credenciales cargadas en el panel

- **Given** una cuenta de Mercado Pago del negocio
- **When** el dueño pega Public Key y Access Token en Ajustes y guarda
- **Then** la opción Mercado Pago queda activa en la reserva y en ventas
- **And** el Access Token no aparece en ninguna respuesta del front

#### Scenario: Sin credenciales

- **When** el negocio no configuró credenciales
- **Then** el cliente puede reservar eligiendo "En la barbería" o
  "Transferencia", pero no ve la opción de pagar en línea

### Requirement: Checkout de Mercado Pago real

Cuando el negocio tiene credenciales y el cliente elige pagar en línea, la app
SHALL crear una preferencia en Mercado Pago vía backend y el cliente es
redirigido al flujo de pago de Mercado Pago. Al confirmarse el pago, la venta se
marca como pagada.

#### Scenario: Pagar en línea

- **Given** un negocio con credenciales de MP configuradas
- **When** el cliente reserva y elige pagar en línea
- **Then** se crea la preferencia y se redirige a Mercado Pago
- **And** al volver de un pago aprobado, la venta aparece como pagada

#### Scenario: Pago rechazado o cancelado

- **When** el cliente cancela el pago en Mercado Pago
- **Then** puede volver a la reserva sin que la venta se marque como pagada

### Requirement: Sin links de pago falsos

SHALL eliminarse el comportamiento falso que generaba `https://mp.la/...` sin
checkout real. Un pago en línea sin credenciales SHALL informarse como no
disponible, nunca generar un enlace ficticio.

#### Scenario: Venta con "En línea" sin credenciales

- **When** un barbero registra una venta manual y elige "En línea" sin haber
  configurado credenciales MP
- **Then** no se genera ningún enlace falso
- **And** el sistema indica que el pago en línea no está configurado

### Requirement: Métodos en el registro de venta

La lista de métodos del registro de venta (RegistroVenta) SHALL dejar de ser
fija y reflejar solo los métodos activos de la barbería. "Tarjeta" se considera
pago presencial y no un método separado.

#### Scenario: Métodos activos en venta

- **Given** una barbería con Efectivo y Transferencia activos
- **When** el barbero abre el registro de venta
- **Then** solo puede elegir Efectivo o Transferencia
- **And** no aparece Tarjeta ni En línea

#### Scenario: Método en línea genera pago real

- **When** el barbero registra una venta con "Mercado Pago" y el negocio tiene
  credenciales
- **Then** se crea la preferencia de pago como en la reserva

