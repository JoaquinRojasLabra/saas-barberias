# Acceso del Barbero

## ADDED Requirements

### Requirement: Pantalla de acceso

SHALL existir una pantalla de inicio de sesión que proteja el panel y la
configuración.

#### Scenario: Ingresar con cuenta demo

- **Given** una cuenta demo configurada por defecto
- **When** el usuario ingresa nombre y contraseña correctos
- **Then** se muestra el panel
- **And** el estado de sesión persiste en la recarga

#### Scenario: Credenciales incorrectas

- **When** el usuario ingresa una contraseña incorrecta
- **Then** ve un mensaje de error y no se muestra el panel

### Requirement: Sesión persistente

La sesión SHALL mantenerse activa al recargar la página hasta que el usuario
salga.

#### Scenario: Recarga mantiene sesión

- **Given** el usuario ya inició sesión
- **When** recarga la página
- **Then** sigue dentro sin volver a pedir credenciales

#### Scenario: Cerrar sesión

- **When** el usuario elige "Cerrar sesión"
- **Then** vuelve a la pantalla de acceso y el panel queda protegido

### Requirement: Configuración de credenciales

El usuario SHALL poder cambiar la contraseña desde Ajustes.

#### Scenario: Cambiar contraseña

- **When** el usuario cambia la contraseña y guarda
- **Then** la nueva contraseña es válida al volver a entrar