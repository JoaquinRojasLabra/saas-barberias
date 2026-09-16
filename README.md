# SaaS Barberías

Plataforma SaaS para gestión integral de barberías. Agenda, ventas, clientes, reservas online, QR para walk-ins, WhatsApp automatizado y página pública personalizable.

## Características

- **Dashboard** — métricas en tiempo real (escaneos QR, ventas, citas), gráfico de ventas, KPIs animados
- **Agenda** — gestión de turnos con drag, estados (pendiente/en curso/terminado), recordatorios automáticos
- **Clientes** — ficha completa con historial de visitas, deudas y datos de contacto
- **Ventas** — registro de servicios y productos, métodos de pago (efectivo, transferencia, Mercado Pago)
- **QR Walk-in** — código QR dinámico para que clientes se registren al llegar, dashboard de escaneos en vivo
- **WhatsApp** — recordatorios automáticos de citas vía cron, credenciales configurables desde Ajustes
- **Página pública** — sitio público por negocio con logo, galería, horarios y reservas online
- **Reservas online** — clientes reservan turnos directamente desde la página pública
- **Personalización** — identidad visual del negocio (logo 3D, colores, galería de fotos)
- **Brand customization** — cada barbería tiene su propia identidad visual (logo, color, galería)

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 + Vite 8 |
| Estilos | Tailwind CSS v4 |
| Animaciones | Framer Motion, GSAP, Three.js |
| Iconos | Phosphor Icons |
| Base de datos | Supabase (PostgreSQL + Auth + RPC) |
| QR | qrcode.react |
| Testing | Vitest + Testing Library |
| Linting | Oxlint |
| Deploy | Vercel |

## Estructura

```
src/
├── components/
│   ├── agenda/        # Gestión de turnos
│   ├── ajustes/       # Configuración (credenciales WhatsApp)
│   ├── clientes/      # Ficha e historial de clientes
│   ├── dashboard/     # Métricas, gráficos, KPIs
│   ├── personalizacion/ # Identidad visual del negocio
│   ├── public/        # Logo 3D
│   ├── qr/            # Código QR walk-in
│   └── ventas/        # Registro de ventas
├── context/           # Estado global (store)
├── data/              # Datos estáticos
├── lib/               # Utilidades (auth, format, supabase, whatsapp, etc.)
├── pages/             # Página pública y reserva online
└── test/              # Suite de tests (14 archivos)
```

## Arquitectura

Diagrama interactivo de la arquitectura del sistema: [saas-barberias.architecture.html](diagrams/saas-barberias.architecture.html)

**Flujos principales:**

| Flujo | Descripción |
|-------|-------------|
| **Reserva online** | Cliente → Página pública `/c/:slug` → RPC `reservar_turno` (anónima) → Postgres |
| **Gestión del negocio** | Dueño/Barbero → Panel React → Supabase Auth → CRUD por `negocio_id` |
| **Pagos Mercado Pago** | Panel → Edge fn `mp-checkout` → preferencia → Webhook → marca venta pagada |
| **Recordatorios WhatsApp** | `pg_cron` + `pg_net` → Cloud API → template al cliente; token nunca sale de la DB |

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run test` | Ejecutar tests |
| `npm run test:watch` | Tests en watch mode |
| `npm run lint` | Linting con Oxlint |

## Deploy

```bash
npx vercel --prod
```

## Variables de entorno

El proyecto usa Supabase. Configura las credenciales en un archivo `.env.local`:

```
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_key
```

## Licencia

Proyecto privado.
