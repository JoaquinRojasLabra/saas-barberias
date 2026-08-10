# Personalización de negocio

## ADDED Requirements

### Requirement: Identidad del negocio editable

El dueño SHALL poder editar nombre, dirección, teléfono, **ciudad** y
**horario** (hora de apertura y cierre) de su barbería desde la pestaña
"Identidad". La página pública SHALL mostrar estos valores en lugar de
textos fijos.

#### Scenario: Editar ciudad y horario

- **Given** un dueño autenticado en Personalización → Identidad
- **When** cambia la ciudad a "Valparaíso" y el horario a "10:00 – 20:00" y
  guarda
- **Then** la página pública muestra "Valparaíso" y "10:00 – 20:00"
- **And** el cambio persiste al recargar

#### Scenario: Sin ciudad/horario definidos

- **When** el negocio no definió ciudad u horario
- **Then** la página pública no muestra ese chip (sin textos falsos)

### Requirement: Color de acento personalizado

El dueño SHALL poder elegir un color de acento para su barbería. Ese color
SHALL reemplazar el color del tema en botones y acentos de la página pública
y del panel. El dueño SHALL poder restablecer el color y volver al estilo
base del tema.

#### Scenario: Aplicar color de marca

- **Given** un negocio con tema Noir
- **When** el dueño elige el color dorado y guarda
- **Then** los botones y acentos de la página pública usan el dorado
- **And** el resto del estilo (fondos, tipografía, formas) sigue siendo Noir

#### Scenario: Restablecer color

- **When** el dueño pulsa "Restablecer"
- **Then** el color custom se borra
- **And** la página vuelve al color base del tema elegido

### Requirement: Selección de logo (3D o imagen)

El dueño SHALL poder elegir el tipo de logo de su barbería: **3D procedural**
(la figura animada existente, coloreada con su color de marca) o **imagen**
(subir un archivo o pegar una URL). La página pública SHALL mostrar el logo
elegido.

#### Scenario: Logo imagen

- **Given** un dueño en Personalización → Logo
- **When** sube o pega una imagen y guarda
- **Then** la página pública muestra esa imagen como logo

#### Scenario: Logo 3D con color de marca

- **When** el dueño elige tipo 3D y tiene color de acento definido
- **Then** la página pública muestra la figura 3D animada en su color

#### Scenario: Logo imagen sin foto

- **Given** tipo de logo "imagen" activado
- **When** no hay foto cargada
- **Then** la página pública cae al logo 3D por defecto (no se ve rota)

### Requirement: Galería de trabajos opcional

El dueño SHALL poder agregar fotos de trabajos (subiendo archivo o pegando
URL), reordenarlas y borrarlas. La galería SHALL tener un interruptor
**"Mostrar galería en mi página"**: si está desactivada o vacía, la sección
de galería no aparece en la página pública.

#### Scenario: Activar y agregar fotos

- **Given** un dueño en Personalización → Galería
- **When** activa "Mostrar galería", sube 3 fotos y guarda
- **Then** la página pública muestra la sección "Nuestros trabajos" con las 3
  fotos en grilla

#### Scenario: Galería desactivada

- **When** la galería está desactivada o no tiene fotos
- **Then** la página pública no muestra la sección de galería

#### Scenario: Foto rota

- **When** una foto de la galería no carga
- **Then** se muestra una tarjeta gris con ícono en su lugar

### Requirement: Vista previa en vivo y guardado

La página "Personalización" SHALL mostrar una vista previa en vivo de la
página pública con los cambios aplicados, sin necesidad de guardar, y un único
botón "Guardar" que persiste todo. En pantallas pequeñas la vista previa se
apila debajo de los formularios.

#### Scenario: Guardado de personalización

- **Given** el dueño con cambios en varias pestañas
- **When** pulsa "Guardar"
- **Then** todos los cambios persisten
- **And** se muestran en la página pública al recargar

### Requirement: Solo el dueño edita

SHALL ser responsabilidad únicamente del dueño editar identidad, estilo,
logo y galería. Los barberos SHALL poder ver la sección Personalización pero
no modificar los campos.

#### Scenario: Barbero sin permisos de edición

- **Given** un barbero autenticado
- **When** abre Personalización
- **Then** ve los valores pero los campos están deshabilitados

#### Scenario: Dueño edita

- **Given** un dueño autenticado
- **When** abre Personalización
- **Then** puede editar y guardar todos los campos