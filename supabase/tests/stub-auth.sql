-- Solo para probar las políticas en un Postgres local: imita lo mínimo de Supabase
-- (roles anon/authenticated, auth.users y auth.uid()). En Supabase esto ya existe.
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema auth, public to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
