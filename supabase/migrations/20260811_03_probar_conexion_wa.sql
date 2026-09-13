-- SaaS Barberías v4 — Probar conexión WhatsApp Business
-- Envía la plantilla a un teléfono de prueba usando las credenciales
-- guardadas en wa_credenciales (solo el dueño, vía security definer).
-- Usa pg_net (async) y consulta net._http_response para devolver el resultado.
create or replace function public.probar_conexion_wa(p_telefono text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_negocio uuid := public.negocio_de_usuario();
  v_cred public.wa_credenciales%rowtype;
  v_nombre text;
  v_url text;
  v_body jsonb;
  v_req bigint;
  v_code int;
  v_content jsonb;
  v_tries int := 0;
begin
  if v_negocio is null then
    raise exception 'solo el dueño del negocio puede probar la conexión';
  end if;
  if nullif(trim(p_telefono), '') is null then
    raise exception 'escribe el teléfono de prueba';
  end if;

  select * into v_cred
  from public.wa_credenciales where negocio_id = v_negocio;
  if v_cred.negocio_id is null then
    raise exception 'primero guarda tus credenciales de WhatsApp';
  end if;

  select nombre into v_nombre from public.negocios where id = v_negocio;

  v_url := 'https://graph.facebook.com/v20.0/' || v_cred.wa_phone_id || '/messages';
  v_body := jsonb_build_object(
    'messaging_product', 'whatsapp',
    'to', trim(p_telefono),
    'type', 'template',
    'template', jsonb_build_object(
      'name', v_cred.wa_template_name,
      'language', jsonb_build_object('code', 'es'),
      'components', jsonb_build_array(
        jsonb_build_object(
          'type', 'body',
          'parameters', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', v_nombre),
            jsonb_build_object('type', 'text', 'text', to_char(now() + interval '2 hours', 'DD/MM/YYYY')),
            jsonb_build_object('type', 'text', 'text', to_char(now() + interval '2 hours', 'HH24:MI'))
          )
        )
      )
    )
  );

  select net.http_post(
    url := v_url,
    body := v_body,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_cred.wa_token
    )
  ) into v_req;

  while (v_code is null and v_tries < 10) loop
    perform pg_sleep(1);
    select status_code into v_code
    from net._http_response where id = v_req;
    v_tries := v_tries + 1;
  end loop;

  select content into v_content
  from net._http_response where id = v_req;

  if v_code is null then
    return json_build_object(
      'ok', false,
      'mensaje', 'El mensaje de prueba todavía no logró enviarse. Espera unos segundos y vuelve a intentar.'
    );
  end if;

  if v_code = 200 then
    return json_build_object(
      'ok', true, 'http_status', v_code,
      'mensaje', '¡Listo! Recibiste el mensaje de prueba en tu WhatsApp.'
    );
  end if;

  return json_build_object(
    'ok', false, 'http_status', v_code,
    'mensaje', 'Error de la WhatsApp API',
    'detalle', v_content
  );
end
$$;

revoke all on function public.probar_conexion_wa(text) from public;
grant execute on function public.probar_conexion_wa(text) to authenticated;