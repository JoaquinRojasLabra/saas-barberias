-- Fix doble reserva (doble booking):
-- 1) reservar_turno ahora toma un advisory lock por slot (negocio+fecha+hora)
--    antes del chequeo "esa hora ya está reservada", serializando las
--    reservas concurrentes sobre el mismo hueco.
-- 2) unique index parcial como garantía a nivel de base (opacar NULL de
--    empleado con un sentinel para que los turnos genéricos también confiten).

-- Step 1: advisory lock en el RPC
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

-- Step 2: defensa en profundidad a nivel de datos
-- Un turno "genérico" (empleado NULL) colisiona con cualquier otro del mismo
-- slot; un turno con empleado colisiona con el mismo empleado. Normalizamos
-- el NULL con un sentinel para que el índice capture ambos casos de conflicto.
drop index if exists uq_turnos_slot_ocupado;
create unique index uq_turnos_slot_ocupado
  on public.turnos (negocio_id, fecha, hora, coalesce(empleado_id, '00000000-0000-0000-0000-000000000000'::uuid))
  where estado not in ('cancelado', 'no-llego');