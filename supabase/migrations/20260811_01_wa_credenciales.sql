-- SaaS Barberías v4 — Recordatorio por WhatsApp (server-side)
-- 1) wa_credenciales: token / phone_id / plantilla por negocio.
--    El navegador NUNCA puede leer esta tabla: el token solo lo usa el cron
--    server-side (pg_cron + pg_net). Se revocan todos los selects.
-- 2) RPC guardar_credenciales_wa: escritura del dueño (mismo patrón MP).
-- 3) datos_pago expone waConfigurado y waTemplateName (sin la data sensible).
-- 4) fix reservar_turno: pendiente = null -> false (evita not null = null en pagados).

-- 1) credenciales de WhatsApp Business API por negocio
create table if not exists public.wa_credenciales (
  negocio_id uuid primary key references public.negocios(id) on delete cascade,
  wa_token text not null,
  wa_phone_id text not null,
  wa_template_name text not null default 'recordatorio_cita',
  updated_at timestamptz not null default now()
);

alter table public.wa_credenciales enable row level security;

create policy "wa_credenciales_insert_dueno" on public.wa_credenciales
  for insert to authenticated with check (negocio_id = public.negocio_de_usuario());
create policy "wa_credenciales_update_dueno" on public.wa_credenciales
  for update to authenticated using (negocio_id = public.negocio_de_usuario())
  with check (negocio_id = public.negocio_de_usuario());
create policy "wa_credenciales_delete_dueno" on public.wa_credenciales
  for delete to authenticated using (negocio_id = public.negocio_de_usuario());

-- escritura mínima para el dueño; lectura totalmente revocada
grant insert (negocio_id, wa_token, wa_phone_id, wa_template_name, updated_at) on public.wa_credenciales to authenticated;
grant update (negocio_id, wa_token, wa_phone_id, wa_template_name, updated_at) on public.wa_credenciales to authenticated;
grant delete on public.wa_credenciales to authenticated;
revoke all on public.wa_credenciales from anon;
revoke select, references on public.wa_credenciales from authenticated;

-- 2) RPC security definer para guardar credenciales WA.
--    Igual patrón que guardar_credenciales_mp: evita el quirk de RLS de
--    INSERT...ON CONFLICT y valida que el caller autenticado sea el dueño.
create or replace function public.guardar_credenciales_wa(
  p_wa_token text,
  p_wa_phone_id text,
  p_wa_template_name text default 'recordatorio_cita'
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_negocio uuid := public.negocio_de_usuario();
begin
  if v_negocio is null then
    raise exception 'solo el dueño del negocio puede guardar credenciales';
  end if;
  insert into public.wa_credenciales (negocio_id, wa_token, wa_phone_id, wa_template_name, updated_at)
  values (v_negocio, p_wa_token, p_wa_phone_id, coalesce(p_wa_template_name, 'recordatorio_cita'), now())
  on conflict (negocio_id) do update set
    wa_token = excluded.wa_token,
    wa_phone_id = excluded.wa_phone_id,
    wa_template_name = excluded.wa_template_name,
    updated_at = excluded.updated_at;
  return json_build_object('negocio_id', v_negocio, 'ok', true);
end
$$;

revoke all on function public.guardar_credenciales_wa(text, text, text) from public;
grant execute on function public.guardar_credenciales_wa(text, text, text) to authenticated;

-- 3) datos_pago: expone si el negocio ya configuró WhatsApp y el nombre de
--    plantilla activa. NUNCA expone token ni phone_id.
create or replace function public.datos_pago(p_negocio uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_pref public.preferencias%rowtype;
  v_mp boolean;
  v_wa boolean;
  v_wa_template_name text;
  v_barberos json;
begin
  v_pref := null;
  select * into v_pref from public.preferencias where negocio_id = p_negocio;
  v_mp := exists(select 1 from public.mp_credenciales c where c.negocio_id = p_negocio);
  select wa_template_name into v_wa_template_name
  from public.wa_credenciales where negocio_id = p_negocio;
  v_wa := v_wa_template_name is not null;
  select coalesce(json_agg(
      json_build_object(
        'id', e.id,
        'nombre', e.nombre,
        'transferencias', case when e.transferencias_numero is not null then
          json_build_object(
            'banco', e.transferencias_banco,
            'tipoCuenta', e.transferencias_tipo_cuenta,
            'numero', e.transferencias_numero,
            'rut', e.transferencias_rut,
            'titular', e.transferencias_titular
          )
        else null end
      ) order by e.created_at
    ), '[]')
  into v_barberos
  from public.empleados e where e.negocio_id = p_negocio;

  return json_build_object(
    'efectivo', coalesce(v_pref.pago_efectivo, true),
    'transferencia', coalesce(v_pref.pago_transferencia, false),
    'mp', coalesce(v_pref.pago_mp, false),
    'mpConfigurado', v_mp,
    'waConfigurado', v_wa,
    'waTemplateName', v_wa_template_name,
    'transferenciaNegocio', case when v_pref.transferencias_numero is not null then
      json_build_object(
        'banco', v_pref.transferencias_banco,
        'tipoCuenta', v_pref.transferencias_tipo_cuenta,
        'numero', v_pref.transferencias_numero,
        'rut', v_pref.transferencias_rut,
        'titular', v_pref.transferencias_titular
      )
    else null end,
    'barberos', v_barberos
  );
end
$$;

revoke all on function public.datos_pago(uuid) from public;
grant execute on function public.datos_pago(uuid) to anon, authenticated;

-- 4) fix reservar_turno: si p_metodo_pago es null, 'x in (...)' da null y
--    not null = null = null -> el turno pagado contaba como pendiente.
create or replace function public.reservar_turno(
  p_negocio uuid,
  p_nombre text,
  p_whatsapp text,
  p_telefono text,
  p_servicio uuid,
  p_empleado uuid,
  p_fecha date,
  p_hora time,
  p_metodo_pago text
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cliente uuid;
  v_turno uuid;
  v_venta uuid;
  v_precio int;
  v_pendiente boolean;
begin
  if auth.uid() is not null then
    raise exception 'no permitido para usuarios autenticados';
  end if;
  if not exists (select 1 from public.negocios n where n.id = p_negocio) then
    raise exception 'negocio inexistente';
  end if;
  if not exists (select 1 from public.servicios s where s.id = p_servicio and s.negocio_id = p_negocio) then
    raise exception 'servicio no pertenece al negocio';
  end if;
  if p_empleado is not null and not exists (select 1 from public.empleados e where e.id = p_empleado and e.negocio_id = p_negocio) then
    raise exception 'empleado no pertenece al negocio';
  end if;

  -- Serializa reservas concurrentes del mismo slot (evita doble booking)
  perform pg_advisory_xact_lock(hashtextextended(
    p_negocio::text || '|' || p_fecha::text || '|' || p_hora::text, 0));

  if exists (
    select 1 from public.turnos t
    where t.negocio_id = p_negocio
      and t.fecha = p_fecha
      and t.hora = p_hora
      and (p_empleado is null or t.empleado_id = p_empleado)
      and t.estado not in ('cancelado', 'no-llego')
  ) then
    raise exception 'esa hora ya está reservada';
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

  select precio into v_precio from public.servicios where id = p_servicio;

  -- El pago se difiere (crea venta pendiente) solo si paga a distancia
  -- (Transferencia o Mercado Pago); en barbería se cobra al momento.
  v_pendiente := coalesce(p_metodo_pago in ('Transferencia', 'Mercado Pago'), false);

  insert into public.turnos (negocio_id, cliente_id, servicio_id, empleado_id, fecha, hora, estado, metodo_pago, pagado, origen)
  values (p_negocio, v_cliente, p_servicio, p_empleado, p_fecha, p_hora, 'confirmado',
          case when p_metodo_pago is null then null else p_metodo_pago end,
          not v_pendiente,
          'web-publico')
  returning id into v_turno;

  if v_pendiente and v_precio > 0 then
    insert into public.ventas (negocio_id, cliente_id, servicio_id, turno_id, empleado_id, monto, fecha_hora, metodo, pagado, pendiente_pago)
    values (p_negocio, v_cliente, p_servicio, v_turno, p_empleado, v_precio, now(), p_metodo_pago, false, true)
    returning id into v_venta;
  end if;

  return json_build_object('cliente_id', v_cliente, 'turno_id', v_turno, 'venta_id', v_venta);
end
$$;

revoke all on function public.reservar_turno(uuid, text, text, text, uuid, uuid, date, time, text) from public;
grant execute on function public.reservar_turno(uuid, text, text, text, uuid, uuid, date, time, text) to anon;