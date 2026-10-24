# Progreso de la corrida nocturna

> Memoria de la corrida. Si se pierde el hilo: releer este archivo, `SPEC.md`, `CLAUDE.md` y `DECISIONES.md`, y retomar desde el primer ítem sin marcar.
> Prioridad si falta tiempo: M0 → M4 → M5 → M6 → M10 → M7 → M9 → M8.
> Al cerrar cada módulo: lint + typecheck + test en verde, capturas a 390 px en `capturas/<modulo>/`, review de animaciones si hay movimiento, commit y `playbook.bundle` (no hay repo remoto, ver REPORTE).

- [x] **M0.** Cambios de la sección 1 (hidratación, modo sol, pantalla 2, contraste de fichas). Repo.
- [x] **M1.** Base: tipos del prompt, Archivo local, Dexie (`ejercicios`, `sesiones`, `ajustes`), Serwist, layout mobile, tema oscuro.
- [x] **M2.** Tipos + biblioteca semilla 20 ejercicios + 4 tareas de arquero + validador que rompe el build.
- [x] **M3.** Pizarra: render + reproductor (play/pausa, velocidad, loop, pasos), MotionPath, stroke-dashoffset, IntersectionObserver, reduced motion.
- [x] **M4.** Motor de generación + tests de la sección 5 + flujo de 3 pantallas con momentos firma 1, 2 y 3.
- [x] **M5.** Modo cancha: cronómetro, silbato visual, vibración, Wake Lock, modo sol, vertical y horizontal.
- [x] **M6.** Biblioteca con filtros + ficha completa.
- [x] **M7.** Editor desktop + boceto mobile + "Duplicar y editar". (`e2e/editor.mjs` 19/19, `e2e/boceto.mjs` 10/10, capturas en `capturas/m7`)
- [x] **M8.** Supabase detrás de env: auth, sync (test con mock), `/e/[id]`, RLS, migraciones. (RLS probado en Postgres 16 local; `tests/sync.test.ts` 10/10; `e2e/nube.mjs` 10/10 sin env; `e2e/nube-mock.mjs` 15/15 con nube simulada; Mi club)
- [x] **M9.** Exportar PNG 1080 × 1350. (ficha y editor; `e2e/exportar.mjs` 10/10; pósters en `capturas/m9`)
- [x] **M10.** Biblioteca completa: 60 ejercicios + 8 tareas de arquero, pizarras de 2 a 6 pasos, validador en verde.
- [x] **M11.** Verificación final (Playwright 390 y 1440, offline, video), `web-design-guidelines`, REPORTE.md, README.md. (`BASE=http://localhost:3100 npm run e2e` en verde; ver REPORTE)

## Notas de estado
- Repo remoto: no se pudo crear (token de GitHub inválido en la sesión). Se entrega `playbook.bundle`.
