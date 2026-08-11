-- 7) RPC security definer para guardar credenciales MP.
--    Evita el quirk de RLS de INSERT...ON CONFLICT (que exige pasar las políticas
--    INSERT y UPDATE a la vez y con los grants de columna daría error 42501).
--    El navegador NUNCA lee la tabla: solo escribe vía esta función, que valida
--    que el caller autenticado sea el dueño del negocio.
create or replace function public.guardar_credenciales_mp(
  p_public_key text,
  p_access_token text
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
  insert into public.mp_credenciales (negocio_id, mp_public_key, mp_access_token, updated_at)
  values (v_negocio, p_public_key, p_access_token, now())
  on conflict (negocio_id) do update set
    mp_public_key = excluded.mp_public_key,
    mp_access_token = excluded.mp_access_token,
    updated_at = excluded.updated_at;
  return json_build_object('negocio_id', v_negocio, 'ok', true);
end
$$;

revoke all on function public.guardar_credenciales_mp(text, text) from public;
grant execute on function public.guardar_credenciales_mp(text, text) to authenticated;