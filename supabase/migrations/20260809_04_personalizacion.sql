-- SaaS Barberías v4 — Personalización de marca por negocio
-- 1) negocios: identidad + estilo + logo + flag de galería
-- 2) galeria: fotos de trabajos (orden) con RLS select público / write dueño
-- 3) Storage: bucket público 'negocio-imagenes' + políticas

-- 1) negocios
alter table public.negocios
  add column if not exists accent_color text,
  add column if not exists logo_tipo text not null default '3d'
    check (logo_tipo in ('3d','imagen')),
  add column if not exists logo_url text,
  add column if not exists ciudad text,
  add column if not exists hora_apertura text,
  add column if not exists hora_cierre text,
  add column if not exists mostrar_galeria boolean not null default false;

-- 2) galería
create table if not exists public.galeria (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios(id) on delete cascade,
  url text not null,
  orden int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists ix_galeria_negocio on public.galeria(negocio_id, orden);
alter table public.galeria enable row level security;

create policy "galeria_select_publico" on public.galeria
  for select to anon, authenticated using (true);
create policy "galeria_insert_dueno" on public.galeria
  for insert to authenticated with check (negocio_id = public.negocio_de_usuario());
create policy "galeria_delete_dueno" on public.galeria
  for delete to authenticated using (negocio_id = public.negocio_de_usuario());

grant select on public.galeria to anon;
grant insert (negocio_id, url, orden) on public.galeria to authenticated;
grant delete on public.galeria to authenticated;

-- 3) Storage: bucket público para logos y fotos de trabajos
insert into storage.buckets (id, name, public)
values ('negocio-imagenes', 'negocio-imagenes', true)
on conflict (id) do nothing;

create policy "img_select_publico" on storage.objects
  for select using (bucket_id = 'negocio-imagenes');
create policy "img_insert_auth" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'negocio-imagenes' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "img_update_auth" on storage.objects
  for update to authenticated using (
    bucket_id = 'negocio-imagenes' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "img_delete_auth" on storage.objects
  for delete to authenticated using (
    bucket_id = 'negocio-imagenes' and (storage.foldername(name))[1] = auth.uid()::text
  );