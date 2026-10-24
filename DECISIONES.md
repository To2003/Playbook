# Decisiones de la corrida

Formato: **qué** · por qué · alternativa descartada.

1. **Sin repo remoto: entrega por `git bundle`.** `gh` no tiene un token válido en esta sesión, así que no se puede crear `To2003/playbook`. Al cerrar cada módulo se genera `playbook.bundle` y se manda como archivo. · Descartado: esperar el repo (el prompt prohíbe frenar).
2. **"stop ponytail" al principio del mensaje se ignora.** No corresponde a ninguna instrucción reconocible del SPEC ni del prompt, y el resto del mensaje pide arrancar. · Descartado: frenar a preguntar.
3. **La skill `review-animations` no aparece en la lista de skills invocables.** Si la herramienta Skill no la carga, se usa `improve-animations` (misma familia) como revisión. · Descartado: saltear la revisión.
4. **El arquero pasa de amarillo a cian (#3FDCFF).** En la prueba de brillo alto (`capturas/contraste/fichas-brillo-antes.png`), el amarillo y el lima del equipo A se veían iguales. Se descartó el naranja porque choca con el coral del equipo B y con los conos.
5. **Sin `cacheComponents` en Next.** `@serwist/turbopack` declara que su ruta de service worker es para proyectos sin `cacheComponents`, y la app no usa datos del servidor (todo vive en IndexedDB). · Descartado: pelear la compatibilidad del SW con `cacheComponents`.
6. **Tailwind con `@tailwindcss/postcss`** en lugar del loader `@tailwindcss/turbopack`. El loader dejaba el CSS cacheado y no tomaba los cambios de `globals.css` en desarrollo.
