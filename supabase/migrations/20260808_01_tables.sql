-- SaaS Barberías v4 — tablas (esquema public)
create extension if not exists "pgcrypto";

create table if not exists public.negocios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nombre text not null,
  telefono text,
  direccion text,
  tema text not null default 'elegante',
  usuario_auth uuid unique references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.empleados (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  usuario_auth uuid unique references auth.users(id) on delete set null,
  nombre text not null,
  activado boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists ix_empleados_negocio on public.empleados(negocio_id);

create table if not exists public.servicios (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  nombre text not null,
  duracion int not null default 30,
  precio int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists ix_servicios_negocio on public.servicios(negocio_id);

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  nombre text not null,
  whatsapp text,
  telefono text,
  visitas int not null default 0,
  notas text,
  empleado_id uuid references public.empleados(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists ix_clientes_negocio on public.clientes(negocio_id);
create index if not exists ix_clientes_empleado on public.clientes(empleado_id);

create table if not exists public.turnos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  servicio_id uuid not null references public.servicios(id),
  empleado_id uuid references public.empleados(id) on delete set null,
  fecha date not null,
  hora time not null,
  estado text not null default 'confirmado',
  metodo_pago text,
  pagado boolean not null default false,
  origen text not null default 'panel',
  created_at timestamptz not null default now()
);
create index if not exists ix_turnos_negocio_fecha on public.turnos(negocio_id, fecha);
create index if not exists ix_turnos_empleado on public.turnos(empleado_id);

create table if not exists public.ventas (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete set null,
  servicio_id uuid references public.servicios(id),
  turno_id uuid references public.turnos(id) on delete set null,
  empleado_id uuid references public.empleados(id) on delete set null,
  monto int not null default 0,
  fecha_hora timestamptz not null default now(),
  metodo text,
  pagado boolean not null default true,
  pendiente_pago boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists ix_ventas_negocio_fecha on public.ventas(negocio_id, fecha_hora);
create index if not exists ix_ventas_empleado on public.ventas(empleado_id);

create table if not exists public.qr_stats (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  fecha_hora timestamptz not null default now(),
  fuente text
);
create index if not exists ix_qr_negocio on public.qr_stats(negocio_id);

create table if not exists public.preferencias (
  negocio_id uuid primary key references public.negocios(id) on delete cascade,
  horas_recordatorio int not null default 2,
  whatsapp_numero text,
  updated_at timestamptz not null default now()
);

create table if not exists public.slots_horario (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  hora time not null
);
create index if not exists ix_slots_negocio on public.slots_horario(negocio_id);