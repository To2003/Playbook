-- Playbook: tablas para sincronizar lo que vive en IndexedDB (local-first).
-- La app guarda cada registro completo en `datos` (jsonb) y la nube solo lo resguarda y lo
-- comparte entre dispositivos. La biblioteca base no está acá: viaja empaquetada en la app.
--
-- Reglas (SPEC 9.3): cada entrenador ve solo lo suyo; un ejercicio marcado como compartido
-- se puede leer sin login (página pública /e/[id]). Sin datos personales de jugadores.

-- Ejercicios propios ----------------------------------------------------------
create table public.ejercicios (
  id          text primary key check (char_length(id) between 3 and 80),
  autor       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  datos       jsonb not null,
  compartido  boolean not null default false,
  borrado     boolean not null default false,
  -- milisegundos del reloj del dispositivo que hizo el cambio (gana el más nuevo)
  actualizado bigint not null,
  creado      timestamptz not null default now()
);

create index ejercicios_autor_actualizado_idx on public.ejercicios (autor, actualizado);
create index ejercicios_compartidos_idx on public.ejercicios (id) where compartido and not borrado;

alter table public.ejercicios enable row level security;

create policy "ejercicios: el autor ve los suyos" on public.ejercicios
  for select to authenticated
  using ((select auth.uid()) = autor);

create policy "ejercicios: cualquiera ve los compartidos" on public.ejercicios
  for select to anon, authenticated
  using (compartido and not borrado);

create policy "ejercicios: el autor crea los suyos" on public.ejercicios
  for insert to authenticated
  with check ((select auth.uid()) = autor);

create policy "ejercicios: el autor modifica los suyos" on public.ejercicios
  for update to authenticated
  using ((select auth.uid()) = autor)
  with check ((select auth.uid()) = autor);

create policy "ejercicios: el autor borra los suyos" on public.ejercicios
  for delete to authenticated
  using ((select auth.uid()) = autor);

-- Sesiones generadas ----------------------------------------------------------
create table public.sesiones (
  id          text primary key check (char_length(id) between 3 and 80),
  autor       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  datos       jsonb not null,
  borrado     boolean not null default false,
  actualizado bigint not null,
  creado      timestamptz not null default now()
);

create index sesiones_autor_actualizado_idx on public.sesiones (autor, actualizado);

alter table public.sesiones enable row level security;

create policy "sesiones: el autor ve las suyas" on public.sesiones
  for select to authenticated
  using ((select auth.uid()) = autor);

create policy "sesiones: el autor crea las suyas" on public.sesiones
  for insert to authenticated
  with check ((select auth.uid()) = autor);

create policy "sesiones: el autor modifica las suyas" on public.sesiones
  for update to authenticated
  using ((select auth.uid()) = autor)
  with check ((select auth.uid()) = autor);

create policy "sesiones: el autor borra las suyas" on public.sesiones
  for delete to authenticated
  using ((select auth.uid()) = autor);

-- Ajustes de Mi club (una fila por entrenador) -------------------------------
create table public.ajustes (
  id          text not null default 'yo' check (id = 'yo'),
  autor       uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  datos       jsonb not null,
  borrado     boolean not null default false,
  actualizado bigint not null
);

alter table public.ajustes enable row level security;

create policy "ajustes: el autor ve los suyos" on public.ajustes
  for select to authenticated
  using ((select auth.uid()) = autor);

create policy "ajustes: el autor crea los suyos" on public.ajustes
  for insert to authenticated
  with check ((select auth.uid()) = autor);

create policy "ajustes: el autor modifica los suyos" on public.ajustes
  for update to authenticated
  using ((select auth.uid()) = autor)
  with check ((select auth.uid()) = autor);

-- Permisos de la Data API: anon solo lee (y RLS lo limita a los compartidos).
revoke all on public.ejercicios, public.sesiones, public.ajustes from anon, authenticated;
grant select on public.ejercicios to anon;
grant select, insert, update, delete on public.ejercicios, public.sesiones to authenticated;
grant select, insert, update on public.ajustes to authenticated;
