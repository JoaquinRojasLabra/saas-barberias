-- SaaS Barberías v4 — Recordatorio por WhatsApp: cron server-side
-- 1) recordatorios_enviados: dedupe por (negocio, turno). Sin acceso del navegador.
-- 2) enviar_recordatorios_wa(): recorre las credenciales configuradas, encuentra
--    turnos confirmados dentro de la ventana (horas_recordatorio) y llama a la
--    Graph API de WhatsApp con el token guardado en wa_credenciales.
--    El token jamas sale de la base: vía net.http_post, nunca por el navegador.
-- 3) Programación con pg_cron cada minuto.
--
-- NOTA: activar las extensiones pg_cron y pg_net en el Dashboard
-- (Database > Extensions) si no quedaron habilitadas por esta migración.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 1) dedupe de recordatorios ya enviados (solo backend / service role)
create table if not exists public.recordatorios_enviados (
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  turno_id uuid not null references public.turnos(id) on delete cascade,
  enviado_at timestamptz not null default now(),
  primary key (negocio_id, turno_id)
);

alter table public.recordatorios_enviados enable row level security;

-- sin políticas: nadie con rol autenticado/anon accede; solo funciones
-- security definer (postgres, que omite RLS). Sin grants → sin acceso.
revoke all on public.recordatorios_enviados from anon, authenticated;

-- 2) envío de recordatorios (fire-and-forget sobre pg_net)
create or replace function public.enviar_recordatorios_wa()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cred record;
  v_horas int;
  v_nombre_negocio text;
  v_turno record;
  v_wsp text;
  v_url text;
  v_body jsonb;
begin
  for v_cred in
    select c.negocio_id, c.wa_token, c.wa_phone_id, c.wa_template_name
    from public.wa_credenciales c
  loop
    select coalesce(p.horas_recordatorio, 2) into v_horas
    from public.preferencias p
    where p.negocio_id = v_cred.negocio_id;

    select n.nombre into v_nombre_negocio
    from public.negocios n where n.id = v_cred.negocio_id;

    for v_turno in
      select t.id, t.fecha, t.hora, c.telefono, c.whatsapp
      from public.turnos t
      join public.clientes c on c.id = t.cliente_id
      where t.negocio_id = v_cred.negocio_id
        and t.estado = 'confirmado'
        and (t.fecha::timestamp + t.hora) > now() - interval '3 minutes'
        and (t.fecha::timestamp + t.hora) <= now() + (v_horas * interval '1 hour')
        and not exists (
          select 1 from public.recordatorios_enviados r
          where r.negocio_id = v_cred.negocio_id and r.turno_id = t.id
        )
    loop
      v_wsp := coalesce(nullif(trim(v_turno.telefono),''), nullif(trim(v_turno.whatsapp),''));
      continue when v_wsp is null or v_wsp = 'NO_WA';

      v_body := jsonb_build_object(
        'messaging_product', 'whatsapp',
        'to', v_wsp,
        'type', 'template',
        'template', jsonb_build_object(
          'name', v_cred.wa_template_name,
          'language', jsonb_build_object('code', 'es'),
          'components', jsonb_build_array(
            jsonb_build_object(
              'type', 'body',
              'parameters', jsonb_build_array(
                jsonb_build_object('type', 'text', 'text', v_nombre_negocio),
                jsonb_build_object('type', 'text', 'text', to_char(v_turno.fecha, 'DD/MM/YYYY')),
                jsonb_build_object('type', 'text', 'text', to_char(v_turno.hora, 'HH24:MI'))
              )
            )
          )
        )
      );

      -- La plantilla debe tener 3 variables: {{1}} nombre negocio,
      -- {{2}} fecha (DD/MM/YYYY), {{3}} hora (HH:MM).
      v_url := 'https://graph.facebook.com/v20.0/' || v_cred.wa_phone_id || '/messages';

      perform net.http_post(
        url := v_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_cred.wa_token
        ),
        body := v_body::text
      );

      insert into public.recordatorios_enviados (negocio_id, turno_id, enviado_at)
      values (v_cred.negocio_id, v_turno.id, now())
      on conflict do nothing;
    end loop;
  end loop;
end
$$;

revoke all on function public.enviar_recordatorios_wa() from public;
revoke all on function public.enviar_recordatorios_wa() from anon, authenticated;

-- 3) programar el cron (una sola vez; idempotente)
do $$
begin
  if not exists (select 1 from cron.job where jobname = 'wa-recordatorios') then
    perform cron.schedule(
      'wa-recordatorios',
      '* * * * *',
      'select public.enviar_recordatorios_wa();'
    );
  end if;
end $$;