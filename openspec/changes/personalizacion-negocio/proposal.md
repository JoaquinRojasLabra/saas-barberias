# Personalización de marca por negocio

## Why

La app es un SaaS que se vende a muchas barberías; cada dueño debe poder
personalizar la identidad de SU negocio. Hoy la personalización se limita a
elegir uno de 9 temas predefinidos, y la página pública muestra datos fijos
("Santiago", "09:00 – 18:00", logo 3D genérico). El dueño quiere: un color de
marca propio sobre el tema elegido, un logo real (imagen) o el 3D animado
existente, una galería de trabajos **opcional**, y que nombre/teléfono/
dirección/ciudad/horario editables se reflejen en la página pública y en la
página de reserva. Los cambios de estilo deben verse en el panel Y en la
página del cliente, con opción de restablecer al estilo base.

## What Changes

- Nueva vista **"Personalización"** en el panel (menú lateral) con 4 pestañas
  (Identidad · Estilo · Logo · Galería) y una **vista previa en vivo** de la
  página pública, más un botón **Guardar**.
- **Identidad**: además de nombre/dirección/teléfono, se agregan **ciudad** y
  **horario** (apertura/cierre) editables que reemplazan los textos fijos de la
  página pública.
- **Estilo**: selector de tema (los 9 existentes) + **color de acento
  personalizado** con selector de color; botón **Restablecer** que borra el
  color custom y vuelve al estilo base del tema.
- **Logo**: el dueño elige **3D** (figura animated existente, coloreada con su
  color de marca) **o Imagen** (subir archivo o pegar URL).
- **Galería**: fotos de trabajos (subir archivo o pegar URL), reordenables y
  borrables, con interruptor **"Mostrar galería en mi página"** (opcional).
- La **página pública** (`/c/<slug>`) aplica color de marca, logo (2D o 3D),
  ciudad/horario reales y la galería. La **página de reserva**
  (`/c/<slug>/reserva`) usa la misma identidad para mantener consistencia.
- Manejo de errores: imagen rota (placeholder gris con ícono), logo-imagen sin
  foto (fallback al 3D actual).

## Capabilities

### New Capabilities

- `personalizacion-negocio`: el dueño personaliza la identidad de marca de su
  barbería (identidad, estilo, logo, galería), con vista previa en vivo, y
  esos cambios se reflejan en la página pública y de reserva del negocio.

### Modified Capabilities

- `acceso`: solo el dueño edita la personalización; los barberos la ven pero
  no la modifican.
- `pagos`: sin cambios de comportamiento, no se modifica.

## Impact

- **Supabase**: columnas nuevas en `public.negocios` (`accent_color`,
  `logo_tipo`, `logo_url`, `ciudad`, `hora_apertura`, `hora_cierre`) y tabla
  nueva `public.galeria` (`id`, `negocio_id`, `url`, `orden`, `created_at`)
  con RLS. Migración aditiva (no rompe datos existentes).
- **Front**: `store.jsx` cargar/guardar los nuevos campos; nuevas vistas en
  `src/components/personalizacion/` (Identidad, Estilo, Logo, Galería) +
  vista previa en vivo; `Sidebar.jsx` agrega la entrada; `PublicPage.jsx` y
  `PublicReserva.jsx` leen los campos y aplican color/logo/ciudad/horario/
  galería; `theme.jsx` aplica `accent_color` como override del tema.
- `npm run lint` y build deben seguir limpios.