# Configuración del Negocio

## ADDED Requirements

### Requirement: Vista de configuración del negocio

SHALL existir una vista (Ajustes) desde la navegación donde el negocio configura
su identidad, tema y catálogo. Debe sustituir a los datos `negocio` y
`servicios` mock en todo el panel.

#### Scenario: Identidad en vivo

- **Given** un usuario con la barbería ya configurada
- **When** abre Ajustes y cambia nombre, logo y tema
- **Then** el header y el panel muestran los nuevos datos
- **And** el tema elegido se aplica en vivo
- **And** los cambios se persisten al guardar

#### Scenario: Reflejar cambios al instante

- **When** el usuario edita nombre, logo u horario en Ajustes y guarda
- **Then** el panel refleja los cambios de inmediato
- **And** se persisten en `localStorage`

### Requirement: Gestión de servicios

SHALL existir un CRUD de servicios (nombre, duración, precio) que alimente el
registro de venta y la agenda.

#### Scenario: Listar servicios

- **When** se abre Ajustes → Servicios
- **Then** se muestran los servicios existentes con duración y precio

#### Scenario: Agregar un servicio

- **When** el usuario crea un servicio con nombre, duración y precio
- **Then** aparece en la lista
- **And** queda disponible al registrar ventas y agendar turnos
- **And** persiste

#### Scenario: Editar y eliminar

- **When** el usuario edita el precio o elimina un servicio
- **Then** el cambio se refleja en ventas y agenda
- **And** persiste

### Requirement: Mensaje de estado al guardar

SHALL mostrarse una notificación clara cuando se guardan Ajustes o se registra
una venta.

#### Scenario: Aviso de guardado

- **When** el usuario guarda Ajustes o registra una venta
- **Then** ve una notificación clara de que se guardó correctamente