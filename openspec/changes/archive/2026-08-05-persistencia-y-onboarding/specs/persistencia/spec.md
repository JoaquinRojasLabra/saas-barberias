# Persistencia

## ADDED Requirements

### Requirement: Estado persistente en el navegador

Los datos de la barbería SHALL persistirse en `localStorage` y restaurarse al
recargar la página.

#### Scenario: La primera carga siembra datos demo

- **Given** un navegador sin datos guardados para esta app
- **When** se abre el panel por primera vez
- **Then** se cargan los datos demo para que la vista inicial se vea completa
- **And** se escriben en `localStorage` bajo una clave con prefijo único

#### Scenario: Los cambios sobreviven a la recarga

- **Given** una venta o cita ya registrada
- **When** el usuario recarga la página
- **Then** la venta o la cita siguen presentes y el estado se restaura desde
  `localStorage`
- **And** los datos demo ya no vuelven a sembrarse

### Requirement: Guardado automático en cada mutación

Cada mutación del almacén (venta, turno, estado de turno, escaneo QR, ajustes)
SHALL persistir el slice afectado automáticamente.

#### Scenario: Guardar al registrar una venta

- **When** el usuario registra una venta
- **Then** la venta queda guardada en `localStorage`
- **And** persiste aunque se navegue o recargue

#### Scenario: Guardar al configurar el negocio

- **When** el usuario guarda los Ajustes
- **Then** los cambios se persisten al instante