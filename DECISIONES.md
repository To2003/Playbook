# Decisiones de la corrida

Formato: **qué** · por qué · alternativa descartada.

1. **Sin repo remoto: entrega por `git bundle`.** `gh` no tiene un token válido en esta sesión, así que no se puede crear `To2003/playbook`. Al cerrar cada módulo se genera `playbook.bundle` y se manda como archivo. · Descartado: esperar el repo (el prompt prohíbe frenar).
2. **"stop ponytail" al principio del mensaje se ignora.** No corresponde a ninguna instrucción reconocible del SPEC ni del prompt, y el resto del mensaje pide arrancar. · Descartado: frenar a preguntar.
3. **La skill `review-animations` no aparece en la lista de skills invocables.** Si la herramienta Skill no la carga, se usa `improve-animations` (misma familia) como revisión. · Descartado: saltear la revisión.
4. **El arquero pasa de amarillo a cian (#3FDCFF).** En la prueba de brillo alto (`capturas/contraste/fichas-brillo-antes.png`), el amarillo y el lima del equipo A se veían iguales. Se descartó el naranja porque choca con el coral del equipo B y con los conos.
5. **Sin `cacheComponents` en Next.** `@serwist/turbopack` declara que su ruta de service worker es para proyectos sin `cacheComponents`, y la app no usa datos del servidor (todo vive en IndexedDB). · Descartado: pelear la compatibilidad del SW con `cacheComponents`.
6. **Tailwind con `@tailwindcss/postcss`** en lugar del loader `@tailwindcss/turbopack`. El loader dejaba el CSS cacheado y no tomaba los cambios de `globals.css` en desarrollo.
7. **`review-animations` es de invocación exclusiva del usuario** (la herramienta Skill la bloquea). La revisión de cada módulo con movimiento se hace con `improve-animations` y queda en `docs/revision-animaciones/`. Conviene que corras `/review-animations` sobre `src/components/pizarra` y `src/components/flujo`.
8. **Las posiciones de los pasos se calculan a partir de los movimientos** (`src/data/biblioteca/armar.ts`). En una conducción, la bocha que acompaña es la más cercana al jugador (a menos de 3,5 m), tanto al armar los pasos como al animar. · Descartado: escribir todas las posiciones de cada paso a mano (60 ejercicios × varios pasos, propenso a errores).
9. **Los trazos se revelan con una máscara** a la que se le anima `stroke-dashoffset`. Así se dibujan igual las líneas punteadas de pase, que con el truco directo de dashoffset perderían su patrón.
10. **Al terminar el loop, las fichas vuelven a su lugar con una animación de 0,6 s** en vez de saltar de golpe al paso 0.
