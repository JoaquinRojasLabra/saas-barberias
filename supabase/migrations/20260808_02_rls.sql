-- SaaS Barberías v4 — RLS
-- helper: negocio_id del que es dueño el auth.uid() actual
create or replace function public.negocio_de_usuario() returns uuid
language sql stable security invoker as $$
  select n.id
  from public.negocios n
  where n.usuario_auth = auth.uid()
$$;

alter table public.negocios enable row level security;
alter table public.empleados enable row level security;
alter table public.servicios enable row level security;
alter table public.clientes enable row level security;
alter table public.turnos enable row level security;
alter table public.ventas enable row level security;
alter table public.qr_stats enable row level security;
alter table public.preferencias enable row level security;
alter table public.slots_horario enable row level security;

-- políticas negocios
create policy "negocios_select_publico" on public.negocios
  for select to anon, authenticated using (true);
create policy "negocios_insert_propio" on public.negocios
  for insert to authenticated with check (usuario_auth = auth.uid());
create policy "negocios_update_propio" on public.negocios
  for update to authenticated using (usuario_auth = auth.uid())
  with check (usuario_auth = auth.uid());

-- políticas empleados
create policy "empleados_select_dueno" on public.empleados
  for select to authenticated using (negocio_id = public.negocio_de_usuario());
create policy "empleados_select_self" on public.empleados
  for select to authenticated using (usuario_auth = auth.uid());
create policy "empleados_insert_dueno" on public.empleados
  for insert to authenticated with check (negocio_id = public.negocio_de_usuario());
create policy "empleados_update_dueno" on public.empleados
  for update to authenticated using (negocio_id = public.negocio_de_usuario())
  with check (negocio_id = public.negocio_de_usuario());
create policy "empleados_delete_dueno" on public.empleados
  for delete to authenticated using (negocio_id = public.negocio_de_usuario());
-- lectura mínima pública para la página de reserva (solo nombre/id de barberos;
-- las columnas sensibles (usuario_auth, etc.) no tienen grant a anon)
create policy "empleados_select_publico" on public.empleados
  for select to anon using (true);

-- políticas servicios
create policy "servicios_select_publico" on public.servicios
  for select to anon, authenticated using (true);
create policy "servicios_mod_dueno" on public.servicios
  for all to authenticated using (negocio_id = public.negocio_de_usuario())
  with check (negocio_id = public.negocio_de_usuario());

-- políticas clientes
create policy "clientes_select_dueno" on public.clientes
  for select to authenticated using (negocio_id = public.negocio_de_usuario());
create policy "clientes_select_barbero" on public.clientes
  for select to authenticated using (empleado_id in (select id from public.empleados where usuario_auth = auth.uid()));
create policy "clientes_insert_anon" on public.clientes
  for insert to anon with check (negocio_id in (select id from public.negocios));
create policy "clientes_insert_dueno" on public.clientes
  for insert to authenticated with check (negocio_id = public.negocio_de_usuario());
create policy "clientes_update_dueno" on public.clientes
  for update to authenticated using (negocio_id = public.negocio_de_usuario())
  with check (negocio_id = public.negocio_de_usuario());
create policy "clientes_update_barbero" on public.clientes
  for update to authenticated using (empleado_id in (select id from public.empleados where usuario_auth = auth.uid()))
  with check (empleado_id in (select id from public.empleados where usuario_auth = auth.uid()));

-- políticas turnos
create policy "turnos_select_dueno" on public.turnos
  for select to authenticated using (negocio_id = public.negocio_de_usuario());
create policy "turnos_select_barbero" on public.turnos
  for select to authenticated using (empleado_id in (select id from public.empleados where usuario_auth = auth.uid()));
create policy "turnos_insert_anon" on public.turnos
  for insert to anon with check (negocio_id in (select id from public.negocios));
create policy "turnos_insert_dueno" on public.turnos
  for insert to authenticated with check (negocio_id = public.negocio_de_usuario());
create policy "turnos_update_dueno" on public.turnos
  for update to authenticated using (negocio_id = public.negocio_de_usuario())
  with check (negocio_id = public.negocio_de_usuario());
create policy "turnos_update_barbero" on public.turnos
  for update to authenticated
  using (empleado_id in (select id from public.empleados where usuario_auth = auth.uid()))
  with check (empleado_id in (select id from public.empleados where usuario_auth = auth.uid()));

-- políticas ventas
create policy "ventas_select_dueno" on public.ventas
  for select to authenticated using (negocio_id = public.negocio_de_usuario());
create policy "ventas_select_barbero" on public.ventas
  for select to authenticated using (empleado_id in (select id from public.empleados where usuario_auth = auth.uid()));
create policy "ventas_insert_anon" on public.ventas
  for insert to anon with check (
    negocio_id in (select id from public.negocios)
    and pendiente_pago = true and pagado = false
  );
create policy "ventas_insert_dueno" on public.ventas
  for insert to authenticated with check (negocio_id = public.negocio_de_usuario());
create policy "ventas_update_dueno" on public.ventas
  for update to authenticated using (negocio_id = public.negocio_de_usuario())
  with check (negocio_id = public.negocio_de_usuario());
create policy "ventas_update_barbero" on public.ventas
  for update to authenticated using (empleado_id in (select id from public.empleados where usuario_auth = auth.uid()))
  with check (empleado_id in (select id from public.empleados where usuario_auth = auth.uid()));

-- políticas varias
create policy "qr_select_dueno" on public.qr_stats
  for select to authenticated using (negocio_id = public.negocio_de_usuario());
create policy "qr_insert_dueno" on public.qr_stats
  for insert to authenticated with check (negocio_id = public.negocio_de_usuario());
create policy "qr_insert_anon" on public.qr_stats
  for insert to anon with check (negocio_id in (select id from public.negocios));

create policy "pref_select_dueno" on public.preferencias
  for select to authenticated using (negocio_id = public.negocio_de_usuario());
create policy "pref_insert_dueno" on public.preferencias
  for insert to authenticated with check (negocio_id = public.negocio_de_usuario());
create policy "pref_update_dueno" on public.preferencias
  for update to authenticated using (negocio_id = public.negocio_de_usuario())
  with check (negocio_id = public.negocio_de_usuario());

create policy "slots_select_publico" on public.slots_horario
  for select to anon, authenticated using (negocio_id in (select id from public.negocios));
create policy "slots_write_dueno" on public.slots_horario
  for all to authenticated using (negocio_id = public.negocio_de_usuario())
  with check (negocio_id = public.negocio_de_usuario());

-- grants mínimos para anon
grant select on public.negocios, public.servicios, public.slots_horario to anon;
-- solo columnas públicas de empleados (created_at incluido para poder ordenar)
grant select (id, negocio_id, nombre, created_at) on public.empleados to anon;
grant insert (negocio_id, nombre, whatsapp, telefono, visitas, empleado_id) on public.clientes to anon;
grant insert (negocio_id, cliente_id, servicio_id, empleado_id, fecha, hora, estado, metodo_pago, pagado, origen) on public.turnos to anon;
grant insert (negocio_id, cliente_id, servicio_id, turno_id, empleado_id, monto, fecha_hora, metodo, pagado, pendiente_pago) on public.ventas to anon;

-- RPC única de reserva anónima: crea cliente + turno (+venta pendiente) y devuelve los ids
-- sin exponer SELECT/returning por anon en las tablas.
create or replace function public.reservar_turno(
  p_negocio uuid,
  p_nombre text,
  p_whatsapp text,
  p_telefono text,
  p_servicio uuid,
  p_empleado uuid,
  p_fecha date,
  p_hora time,
  p_pendiente boolean
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cliente uuid;
  v_turno uuid;
  v_monto int;
begin
  if auth.uid() is not null then
    raise exception 'no permitido para usuarios autenticados';
  end if;
  if not exists (select 1 from public.negocios n where n.id = p_negocio) then
    raise exception 'negocio inexistente';
  end if;
  select id into v_cliente
  from public.clientes
  where negocio_id = p_negocio and nombre = p_nombre
  limit 1;
  if v_cliente is null then
    insert into public.clientes (negocio_id, nombre, whatsapp, telefono, visitas, empleado_id)
    values (p_negocio, p_nombre, p_whatsapp, p_telefono, 0, p_empleado)
    returning id into v_cliente;
  end if;
  select precio into v_monto from public.servicios where id = p_servicio;
  insert into public.turnos (negocio_id, cliente_id, servicio_id, empleado_id, fecha, hora, estado, metodo_pago, pagado, origen)
  values (p_negocio, v_cliente, p_servicio, p_empleado, p_fecha, p_hora, 'confirmado',
          case when p_pendiente then 'En línea' else null end,
          not p_pendiente,
          'web-publico')
  returning id into v_turno;
  if p_pendiente and v_monto > 0 then
    insert into public.ventas (negocio_id, cliente_id, servicio_id, turno_id, empleado_id, monto, fecha_hora, metodo, pagado, pendiente_pago)
    values (p_negocio, v_cliente, p_servicio, v_turno, p_empleado, v_monto, now(), 'En línea', false, true);
  end if;
  return json_build_object('cliente_id', v_cliente, 'turno_id', v_turno);
end
$$;

revoke all on function public.reservar_turno(uuid, text, text, text, uuid, uuid, date, time, boolean) from public;
grant execute on function public.reservar_turno(uuid, text, text, text, uuid, uuid, date, time, boolean) to anon;

-- Slots ya ocupados por reservas activas (lectura segura para anon sin exponer turnos)
create or replace function public.horarios_ocupados(p_negocio uuid, p_fecha date, p_empleado uuid)
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(to_char(t.hora, 'HH24:MI') order by t.hora), '{}')
  from public.turnos t
  where t.negocio_id = p_negocio
    and t.fecha = p_fecha
    and (p_empleado is null or t.empleado_id = p_empleado)
    and t.estado not in ('cancelado', 'no-llego')
$$;

revoke all on function public.horarios_ocupados(uuid, date, uuid) from public;
grant execute on function public.horarios_ocupados(uuid, date, uuid) to anon, authenticated;