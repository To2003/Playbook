#!/bin/sh
# Corre la migración y la prueba de RLS en un Postgres local vacío.
# Uso: PGHOST=... PGPORT=... sh scripts/probar-rls.sh   (crea y borra la base playbook_rls)
set -e
cd "$(dirname "$0")/../supabase"
dropdb --if-exists -U postgres playbook_rls
createdb -U postgres playbook_rls
psql -q -U postgres -d playbook_rls -v ON_ERROR_STOP=1 -f tests/stub-auth.sql $(for f in migrations/*.sql; do printf -- '-f %s ' "$f"; done) -f tests/rls.sql
dropdb -U postgres playbook_rls
