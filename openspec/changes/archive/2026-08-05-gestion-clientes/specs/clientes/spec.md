# Gestión de Clientes

## ADDED Requirements

### Requirement: Alta de cliente desde el panel

El usuario SHALL poder registrar un cliente nuevo desde la sección Clientes sin
salir al backend.

#### Scenario: Registrar un cliente

- **When** el usuario abre "Nuevo cliente" y completa nombre, teléfono y opcional
  notas
- **Then** el cliente aparece en la lista
- **And** queda disponible al registrar ventas y torneos
- **And** persiste en `localStorage`

### Requirement: Edición de cliente

El usuario SHALL poder editar los datos (nombre, teléfono, notas) de un cliente.

#### Scenario: Editar notas y teléfono

- **Given** un cliente existente
- **When** el usuario abre la ficha y edita el teléfono o las notas
- **Then** se guardan los cambios
- **And** se reflejan en la lista

### Requirement: Búsqueda de clientes

SHALL existir un campo de búsqueda para filtrar la lista por nombre o teléfono.

#### Scenario: Buscar por nombre

- **Given** la lista de clientes
- **When** el usuario escribe "Jorge"
- **Then** solo se muestran los clientes cuyo nombre lo contiene