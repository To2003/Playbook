-- Prueba de las políticas de RLS: psql -v ON_ERROR_STOP=1 -f stub-auth.sql -f ../migrations/*.sql -f rls.sql
-- Cada bloque falla con una excepción si una regla no se cumple.
\set ana '00000000-0000-0000-0000-00000000000a'
\set beto '00000000-0000-0000-0000-00000000000b'
insert into auth.users values (:'ana'), (:'beto');

-- Ana sube un ejercicio privado y uno compartido, una sesión y sus ajustes.
set role authenticated;
select set_config('request.jwt.claim.sub', :'ana', false);
insert into public.ejercicios (id, datos, actualizado) values ('p-privado', '{"nombre":"Privado"}', 1);
insert into public.ejercicios (id, datos, compartido, actualizado) values ('p-compartido', '{"nombre":"Rondo"}', true, 1);
insert into public.sesiones (id, datos, actualizado) values ('s-1', '{}', 1);
insert into public.ajustes (datos, actualizado) values ('{"tema":"oscuro"}', 1);
do $$ begin
  if (select count(*) from public.ejercicios) <> 2 then raise exception 'Ana tendría que ver sus 2 ejercicios'; end if;
  if (select autor from public.ejercicios where id = 'p-privado') <> auth.uid() then raise exception 'el autor por defecto tendría que ser Ana'; end if;
end $$;

-- Beto no ve lo privado de Ana, sí lo compartido; no puede tocar nada de ella.
select set_config('request.jwt.claim.sub', :'beto', false);
do $$
declare n int;
begin
  if (select count(*) from public.ejercicios) <> 1 then raise exception 'Beto tendría que ver solo el compartido'; end if;
  if exists (select 1 from public.sesiones) then raise exception 'Beto no tendría que ver sesiones de Ana'; end if;
  if exists (select 1 from public.ajustes) then raise exception 'Beto no tendría que ver ajustes de Ana'; end if;
  update public.ejercicios set datos = '{"nombre":"hackeado"}' where id = 'p-compartido';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'Beto modificó un ejercicio de Ana'; end if;
  delete from public.ejercicios where id = 'p-compartido';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'Beto borró un ejercicio de Ana'; end if;
end $$;

-- Beto no puede crear filas a nombre de Ana.
do $$ begin
  begin
    insert into public.ejercicios (id, autor, datos, actualizado) values ('p-trucho', '00000000-0000-0000-0000-00000000000a', '{}', 1);
    raise exception 'Beto pudo insertar a nombre de Ana';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Ana no puede pasarle un ejercicio a Beto (WITH CHECK del update).
select set_config('request.jwt.claim.sub', :'ana', false);
do $$ begin
  begin
    update public.ejercicios set autor = '00000000-0000-0000-0000-00000000000b' where id = 'p-privado';
    raise exception 'Ana pudo cambiar el autor';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Sin login (anon): solo los compartidos, y no puede escribir.
reset role;
set role anon;
select set_config('request.jwt.claim.sub', '', false);
do $$ begin
  if (select count(*) from public.ejercicios) <> 1 then raise exception 'anon tendría que ver solo el compartido'; end if;
  begin
    perform 1 from public.sesiones;
    raise exception 'anon pudo leer sesiones';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.ejercicios (id, autor, datos, actualizado) values ('p-anon', '00000000-0000-0000-0000-00000000000a', '{}', 1);
    raise exception 'anon pudo insertar';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Un compartido que se borra (borrado = true) deja de ser público.
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', :'ana', false);
update public.ejercicios set borrado = true where id = 'p-compartido';
reset role;
set role anon;
do $$ begin
  if exists (select 1 from public.ejercicios) then raise exception 'un compartido borrado sigue siendo público'; end if;
end $$;
reset role;
select 'RLS: todas las reglas se cumplen' as resultado;
