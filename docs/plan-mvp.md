# Playbook MVP: plan de implementación

**Objetivo:** el MVP completo del SPEC, local-first y offline, con pizarra animada y motor de generación determinístico.

**Arquitectura:**
- App Router 100% client-side en las pantallas de uso (los datos viven en IndexedDB).
- El motor es una librería pura en `src/lib/motor/`.
- La pizarra es SVG en metros, con un reproductor GSAP encima de un render estático (que es también el fallback de reduced motion).
- Supabase queda como capa opcional de sync detrás de variables de entorno.

**Stack:** Next 16 (Turbopack), TS estricto, Tailwind 4, GSAP 3.15 + `@gsap/react`, Dexie 4, `@serwist/turbopack`, Vitest, Playwright.

**Spec:** `SPEC.md` + `PROGRESO.md` (prompt de la corrida nocturna) + `DESIGN.md`.

## Global Constraints
- Rango: 4 a 30 jugadores de campo y 0 a 2 arqueros. Pizarras de 1 a 12 pasos (las base, de 2 a 6).
- Generar la sesión en menos de 300 ms con 70 ejercicios. Respuesta a la interacción en menos de 100 ms.
- Solo `transform`/`opacity` en las animaciones. UI de 150 a 300 ms. Todo interrumpible. Respetar `prefers-reduced-motion`.
- Textos en rioplatense, con voseo. Sin datos personales de jugadores. Sin consejos médicos.
- Hidratación: 2 pausas de 2 min, solo en sesión completa, que se restan a B2 y B4 (tabla del prompt).

## Mapa de archivos
| Archivo | Responsabilidad |
|---|---|
| `src/lib/tipos.ts` | Los tipos del prompt, verbatim, más `ParamsSesion`, `Sesion`, `Bloque`, `Division` y `Ajustes`. |
| `src/lib/motor/azar.ts` | `crearAzar(semilla: number): () => number` (mulberry32). |
| `src/lib/motor/tiempos.ts` | `planDeTiempos(tipo, duracion, intensidad): Hueco[]`, donde `Hueco = { fase, minutos, slot: 1..5 } \| { pausa: true, minutos: 2 }`. |
| `src/lib/motor/division.ts` | `dividir(n: number, formato: Formato, max: number): Division`, con `Division = { partes: number[]; comodines: number; rotan: number; estaciones: number; texto: string }`. Invariante: `sum(partes) + comodines + rotan === n`. |
| `src/lib/motor/generar.ts` | `generarSesion(params, biblioteca, historial, semilla): Sesion`, `dameOtro(sesion, idxBloque, biblioteca, historial, relajar?): { ejercicio, bloque } \| { motivo, sugerencias }` y `candidatos(...)`. |
| `src/lib/validador.ts` | `validarEjercicio(e): string[]` y `validarBiblioteca(lista): string[]` (cobertura de 5.2). |
| `src/data/biblioteca/*.ts` | Un archivo por fase, armado con helpers de `src/data/biblioteca/armar.ts`. `index.ts` exporta `BIBLIOTECA` y `TAREAS_ARQUERO`. |
| `src/lib/db.ts` | Dexie `PlaybookDB`: `ejercicios`, `sesiones`, `ajustes`, `cola`. |
| `src/lib/estado/*.ts` | Hooks: `useAjustes`, `useSesionActual` y `useBiblioteca` (base + propios). |
| `src/lib/pizarra/geometria.ts` | Cancha, proyección (rotación de grupo), trazos (cuadrática, ondulada) y encuadre. |
| `src/components/pizarra/*` | `Cancha`, `Ficha`, `PizarraSVG` (estática), `Reproductor` (GSAP), `Miniatura` (IO), `Controles`. |
| `src/app/(flujo)/...` | `/`, `/armar`, `/armar/opciones`, `/sesion`, `/cancha`. |
| `src/app/biblioteca`, `/ficha` | Biblioteca con filtros. La ficha usa `?id=` para que funcione offline sin ruta dinámica. |
| `src/app/editor`, `/boceto`, `/mi-club`, `/e/[id]` | El resto de las pantallas del SPEC. |
| `src/lib/sync/*` | Cliente Supabase opcional, cola de sync, `compartir`. |
| `supabase/migrations/*.sql` | Esquema y RLS. |
| `tests/*.test.ts` | Motor, división, tiempos, validador, sync y geometría. |
| `e2e/*.spec.ts` | Flujo, offline y capturas. |

## Tests clave (Vitest)
- `division.test.ts`:
  - 11 en dos equipos da `partes [5,5]` y `comodines 1`
  - 7 en parejas da `[2,2,3]`
  - 13 en grupos de 4 da `[4,4,5]`
  - 22 en 3v2 da `partes [5,5,5,5]` y `rotan 2`
  - para todo n de 4 a 30 y todo formato, la suma da n
- `tiempos.test.ts`:
  - las 4 filas de la tabla del prompt, exactas
  - suma exacta para duraciones libres
  - con intensidad suave, B4 baja 20% y esos minutos pasan a la calma
- `motor.test.ts`: la matriz de la sección 5 del prompt (6 × 3 × 3 × 3 × 3 semillas) con las 10 propiedades, más el tiempo menor a 300 ms con 70 ejercicios.
- `biblioteca.test.ts`: `validarBiblioteca(BIBLIOTECA)` da `[]`. Corre en `prebuild`, así que el build falla si un ejercicio rompe las reglas.

## Review Focus
1. **Un ejercicio propio mal cargado** (sin pizarra o con un rango invertido) no puede romper el motor: se filtra con `validarEjercicio`.
2. **"Dame otro" repetido hasta agotar** devuelve el motivo y no se cuelga ni repite.
3. **Ajustar ± minutos** recalcula el total. Nunca baja de 1 minuto por bloque.
4. **Offline en la primera visita después de instalar:** las rutas están precacheadas, no solo las que se visitaron.
5. **Modo cancha cuando la pantalla se apaga y se prende:** el cronómetro se calcula por reloj (`Date.now`), no contando ticks, y el Wake Lock se vuelve a pedir en `visibilitychange`.
