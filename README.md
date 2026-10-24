# Playbook

Web app mobile-first para entrenadores de hockey sobre césped. Contás cuántos vinieron, elegís qué armar y Playbook te arma la sesión con ejercicios animados en una pizarra táctica. Anda sin señal y se puede instalar en el celu.

- Qué hace: [`SPEC.md`](SPEC.md). Cómo se ve y se mueve: [`DESIGN.md`](DESIGN.md).
- Estado de la entrega: [`REPORTE.md`](REPORTE.md). Decisiones tomadas: [`DECISIONES.md`](DECISIONES.md).

## Correrla

Necesitás Node 20 o más nuevo.

```bash
npm i
npm run dev          # http://localhost:3000
npm test             # motor de generación, biblioteca, editor, sync (Vitest)
```

### Probarla en el celu, en la misma red

```bash
npm run dev -- -H 0.0.0.0
```

En el celu abrí `http://<IP de tu compu>:3000` (la IP la ves con `ipconfig` en Windows o `ipconfig getifaddr en0` en Mac). En modo desarrollo el service worker está apagado: para probar sin señal y la instalación, usá el build de producción:

```bash
npm run build
npm start -- -H 0.0.0.0
```

El celu tiene que entrar por `localhost` o por HTTPS para instalar la app y usar Wake Lock. En la red local por IP anda todo lo demás; para la prueba completa conviene un deploy en Vercel.

## Otros comandos

| Comando | Qué hace |
|---|---|
| `npm run lint` · `npm run typecheck` | ESLint y TypeScript estricto |
| `npm run e2e` | Pruebas de punta a punta con Playwright contra `npm run dev` |
| `BASE=http://localhost:3100 npm run e2e` | Lo mismo contra el build (`npm start -- -p 3100`), más la verificación final: 390 y 1440, sin señal y el video de los momentos firma |
| `node e2e/nube-mock.mjs` | Login, sync y compartir contra un Supabase simulado. Requiere el server levantado con `NEXT_PUBLIC_SUPABASE_URL=https://prueba.supabase.test NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-de-prueba` |
| `node e2e/rendimiento.mjs` | Cuadros por segundo con la CPU frenada 4× |
| `sh scripts/probar-rls.sh` | Corre la migración y las pruebas de RLS en un Postgres local (con `PGHOST`/`PGPORT`) |
| `npm run capturas` | Capturas de pantalla a 390 px |

## La cuenta (opcional)

Sin configurar nada, la app anda 100 % en el dispositivo: no hay login y "Compartir link" pide iniciar sesión. Para activar el login con Google, la sincronización y los links públicos, copiá `.env.example` a `.env.local` y seguí los pasos de la sección "Activar Supabase" de [`REPORTE.md`](REPORTE.md).

## Estructura

```
src/app/            pantallas (App Router): inicio, armar, sesión, cancha, biblioteca, ficha,
                    editor, boceto, mis-ejercicios, mi-club, e/[id] (público)
src/components/     pizarra (SVG + GSAP), flujo (momentos firma), editor, ficha, nube
src/lib/motor/      generarSesion(params, biblioteca, historial, semilla): puro y determinístico
src/lib/sync/       cola local-first y sincronización con la nube
src/data/biblioteca 60 ejercicios + 8 tareas de arquero
src/sw/             service worker (Serwist)
supabase/           migración con RLS y sus pruebas
e2e/                pruebas de Playwright
capturas/           capturas por módulo; capturas/final tiene la verificación y los videos
```
