# Reporte de la corrida nocturna

**Estado:** MVP completo (M0 a M11). 8 de 11 criterios ✅ con evidencia; los otros 3 (7, 9 y 10) están implementados y probados con dobles, pero falta la prueba real (un proyecto de Supabase de verdad y un envío por WhatsApp). Lint, typecheck, 233 tests unitarios y 8 suites de Playwright en verde. No hay repo remoto: la entrega es `playbook.bundle`.

## 1. Criterios de aceptación (SPEC 11)

| # | Criterio | | Evidencia |
|---|---|---|---|
| 1 | Sesión completa en 3 pantallas y menos de 15 s | ✅ | `e2e/final.mjs`: `/armar → /armar/opciones → /sesion` en **2,9 s** a 390 px y **2,8 s** a 1440 px (toques automáticos; una persona suma unos segundos de lectura). `capturas/final/{inicio,cuantos-vinieron,que-armamos,sesion}-{390,1440}.png` |
| 2 | 7, 11, 13 y 22 jugadores, con 0 y 2 arqueros: división correcta y ningún arquero sin tarea | ✅ | `tests/motor.test.ts`, matriz de 1458 casos (4, 7, 11, 13, 22 y 30 jugadores × 0, 1 y 2 arqueros × 3 tipos × 3 niveles × 3 intensidades × 3 semillas): la división suma exacto y todo bloque que no usa arqueros les da tarea |
| 3 | Cambiar nivel o intensidad cambia los ejercicios | ✅ | `tests/motor.test.ts` › "cambiar nivel o intensidad cambia los ejercicios, no solo la etiqueta" |
| 4 | "Dame otro" nunca repite en la sesión | ✅ | Matriz de `tests/motor.test.ts`: en cada caso se pide "Dame otro" hasta agotar y nunca vuelve uno ya visto. Swipe real en `capturas/m4/5-*.png` y en el video |
| 5 | En modo avión: generar sesión, modo cancha, biblioteca y boceto | ✅ | `e2e/final.mjs` con el build de producción: service worker activo → `setOffline(true)` → sesión, modo cancha, biblioteca, una ficha y un boceto guardado, sin errores. `capturas/final/offline-*.png`. Falta probarlo instalada en un celu real |
| 6 | 60 ejercicios y 8 tareas de arquero con ficha completa y pizarra animada | ✅ | `tests/biblioteca.test.ts` (el validador corre también antes de cada build) y `capturas/m10/todas-las-pizarras.png`. El contenido lo redacté yo: conviene que lo revise un entrenador (decisión 25) |
| 7 | Ejercicio de 5 pasos hecho en la compu aparece animado en el celu tras sincronizar | ⚠️ | Probado contra un **Supabase simulado**: `e2e/nube-mock.mjs` crea los 5 pasos en el editor a 1440, se sube solo y aparece en otro dispositivo a 390 con la pizarra de 5 pasos (`capturas/m8/celu-despues-de-sync-390.png`). La sync tiene 10 tests con nube en memoria (`tests/sync.test.ts`). **Falta contra un proyecto real** |
| 8 | Un ejercicio propio con fase y rango aparece en las sesiones | ✅ | `tests/motor.test.ts` › "un ejercicio propio con fase y rango entra al motor (criterio 8)" |
| 9 | El link compartido abre sin login y reproduce la animación | ⚠️ | `e2e/nube-mock.mjs`: el link abre en un navegador sin sesión y la pizarra avanza de 1/5 a 2/5 (`capturas/m8/link-sin-login-390.png`); un privado no se abre. RLS probado en Postgres 16 (`scripts/probar-rls.sh`). **Falta contra un proyecto real**. Los links de ejercicios base andan ya, sin nube |
| 10 | El PNG se ve bien por WhatsApp | ⚠️ | 1080 × 1350 (4:5, lo que WhatsApp muestra entero), 400–540 KB, fuente incrustada: `capturas/m9/*.png`, `e2e/exportar.mjs`. **Falta mandarlo de verdad por WhatsApp y mirarlo en el celu** |
| 11 | En modo cancha la pantalla no se apaga y el fin de bloque avisa con vibración y visual | ✅ | `e2e/cancha-aviso.mjs`: pide Wake Lock al entrar; al terminar el bloque vibra `[300,120,300]`, destella y muestra "¡Tiempo!" (`capturas/final/fin-de-bloque-390.png`, `capturas/m5/silbato-*.png`). En iOS la vibración no existe y cae en silencio, como pide el SPEC |

Video de los 5 momentos firma: `capturas/final/momentos-firma-390.webm` (27 s) y el editor con inercia en `capturas/final/editor-inercia-1440.webm` (11 s).

## 2. Qué quedó pendiente y por qué

1. **Repo `To2003/playbook`:** `gh` no tiene un token válido en esta sesión. Va todo en `playbook.bundle` (todas las ramas). Para subirlo:
   ```bash
   git clone playbook.bundle playbook && cd playbook
   gh repo create To2003/playbook --private --source=. --push
   ```
2. **Supabase real:** no hay proyecto ni credenciales. Está todo implementado detrás de las variables y probado con un doble. Hay que activarlo (sección 3) y repetir los criterios 7 y 9 con dos dispositivos.
3. **Prueba en celus reales:** iPhone (Safari) y Android (Chrome), instalada desde la pantalla de inicio: modo avión, Wake Lock, vibración, modo sol al sol y lectura a un metro.
4. **WhatsApp:** mandar un PNG exportado y mirarlo (criterio 10).
5. **Un tirón al armar la sesión con la CPU frenada 4×:** el contador, el swipe, la pizarra y el editor van a 57–60 fps, pero el paso a "Tu sesión" tiene 3 cuadros largos (el peor, 300 ms) mientras se genera y se monta la pantalla (`capturas/final/rendimiento-cpu4x.json`, `e2e/rendimiento.mjs`). Si se nota en un Android de gama media, el próximo paso es generar en un Web Worker.
6. **Filtros de la biblioteca en la URL** (lo marcó `web-design-guidelines`): no rompe nada; sirve para compartir una búsqueda.
7. **Revisión de animaciones con `/review-animations`:** esa skill solo la puede invocar una persona. Cada módulo con movimiento tiene su revisión con `improve-animations` en `docs/revision-animaciones/`.
8. **Documentación oficial:** Context7 y supabase.com no respondían desde la sesión. Se usaron los tipos y el código de los paquetes instalados (`node_modules`) y la doc de Next que viene en `node_modules/next/dist/docs/`.

## 3. Activar Supabase (pasos exactos)

Todo gratis y sin tarjeta. Los nombres de los menús son los que conozco; si el panel cambió, buscá el equivalente.

1. **Proyecto:** en https://supabase.com/dashboard → *New project* (plan Free). Anotá la contraseña de la base.
2. **Tablas y RLS:** *SQL Editor* → *New query* → pegá el contenido de `supabase/migrations/20261024080000_inicial.sql` → *Run*. (Con la CLI: `supabase link --project-ref <ref>` y `supabase db push`.)
3. **Cliente OAuth de Google:** en https://console.cloud.google.com → *APIs & Services* → *Credentials* → *Create credentials* → *OAuth client ID* → tipo *Web application*.
   - *Authorized JavaScript origins:* tu dominio (por ejemplo `https://playbook.vercel.app`) y `http://localhost:3000`.
   - *Authorized redirect URIs:* `https://<ref>.supabase.co/auth/v1/callback` (el `<ref>` está en la URL del proyecto).
   - Si pide pantalla de consentimiento: tipo *External*, con tu mail como usuario de prueba.
4. **Google en Supabase:** *Authentication* → *Sign In / Providers* → *Google* → activalo y pegá *Client ID* y *Client Secret*.
5. **URLs de vuelta:** *Authentication* → *URL Configuration*:
   - *Site URL:* tu dominio de producción.
   - *Redirect URLs:* `https://<tu-dominio>/mi-club` y `http://localhost:3000/mi-club` (el login vuelve a Mi club).
6. **Claves:** *Project Settings* → *API Keys*. Copiá la *Project URL* y la *publishable key* (`sb_publishable_…`; en proyectos viejos, la *anon key*). **Nunca** la `service_role`/secret.
7. **Local:** `cp .env.example .env.local` y completá:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_…
   ```
   Reiniciá `npm run dev` (las variables se leen al compilar).
8. **Vercel:** *Settings* → *Environment Variables* → las mismas dos, en *Production* y *Preview* → *Redeploy*.
9. **Probar:** Mi club → "Entrar con Google" → vuelve con tu mail y "Sincronizado a las …". Creá un ejercicio en la compu, abrí Mis ejercicios en el celu con la misma cuenta y tiene que aparecer. "Compartir link" desde la ficha y abrilo en una ventana de incógnito.

## 4. Las 5 decisiones que más conviene que revises

Están completas en `DECISIONES.md`.

1. **#25, contenido:** los 60 ejercicios y las 8 tareas de arquero los escribí yo. Son correctos en forma y cobertura (el validador lo exige), pero la mirada de un entrenador es la que vale.
2. **#27, borradores en el motor:** por el criterio 8, los bocetos del celu (sin consigna) también entran a las sesiones. Si preferís que entren solo los "listo", está anotado en el Backlog v2 y es una línea en `src/lib/motor/generar.ts`.
3. **#11, aplicado de 120 min:** la tabla de tiempos del prompt pisa al SPEC. Queda un solo aplicado de 33 min en vez de dos.
4. **#20, fin de bloque:** al llegar a cero no pasa solo al siguiente bloque. Aparece "¡Tiempo!" con un botón grande y vos decidís cuándo seguir.
5. **#31 y #32, sincronización:** gana el último cambio por registro, y al entrar por primera vez todo lo hecho sin cuenta se sube y queda a tu nombre. Es simple y alcanza para un entrenador con dos dispositivos; no hay edición simultánea.

## 5. Cómo se verificó

- `npm run lint`, `npm run typecheck`, `npm test`: 233 tests (motor, división, tiempos, cronómetro, geometría, filtros, biblioteca, editor, exportar, sync, IndexedDB).
- `BASE=http://localhost:3100 npm run e2e` contra el build de producción: flujo, modo cancha, fin de bloque, editor (19 chequeos), boceto (11), exportar (10), nube sin variables (10) y la verificación final (14: 390, 1440, sin señal).
- `node e2e/nube-mock.mjs` con la nube encendida contra un Supabase simulado: 15 chequeos.
- `scripts/probar-rls.sh` en Postgres 16 local: todas las políticas.
- `web-design-guidelines`: hallazgos y arreglos en `docs/revision-web-design-guidelines.md`.
- Capturas por módulo en `capturas/m0` a `capturas/m10`, `capturas/contraste` y `capturas/final`.
