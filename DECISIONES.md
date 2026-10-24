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
11. **El aplicado de 120 min es un solo ejercicio (33 min).** La tabla del prompt pisa al SPEC, que pedía 2. El principal lleva 2 ejercicios desde 30 min. · Descartado: partir el aplicado en 17 + 16.
12. **En el tipo "Principal" con intensidad suave**, el 20% que pierde el aplicado vuelve al principal, porque no hay vuelta a la calma que lo absorba.
13. **Duraciones libres en sesión completa:** las pausas quedan fijas en 2 min y el resto se reparte proporcional a la fila de 90 (10/13/30/26/7) por mayor resto. Con intensidad fuerte, si la entrada en calor queda en menos de 15, se completa con minutos del principal.
14. **"Nunca un 3 pegado a la calma" gana sobre "fuerte prioriza 3 en B4".** En una sesión completa fuerte, B4 va con intensidad ≤ 2 si existe alternativa. El 3 queda para el principal (B3).
15. **Material:** se interpreta como presencia (si el ejercicio pide arcos chicos y hoy no hay, se descarta), no como cantidad exacta. Si con material y espacio no queda ningún ejercicio, el motor afloja esos dos filtros antes de fallar.
16. **Grupos de k con resto mayor que la cantidad de grupos** (por ejemplo, 7 en grupos de 4): se arma un grupo más y se reparten parejos (4 y 3), en lugar de un grupo de 7.
17. **Estaciones:** se arman cuando el grupo supera el máximo del ejercicio, en todos los formatos menos superioridad, que se resuelve con células y los que rotan.
18. **Momento 2:** la división que se muestra es la del juego aplicado (o la del principal si no hay aplicado), porque es la que más se ve en la cancha.
19. **El cronómetro se calcula contra el reloj (`finEn`)**, no contando ticks: si la pantalla se apaga o el navegador congela la pestaña, al volver el tiempo es el correcto. El progreso se guarda en `localStorage` (es una comodidad por dispositivo: si se pierde, el bloque arranca de cero).
20. **Al llegar a cero no se pasa solo al bloque siguiente:** aparece "¡Tiempo!" con el botón "Siguiente" grande, que muestra el nombre del que viene. El entrenador decide cuándo, porque en la cancha nunca se corta justo a tiempo. También hay un "Repetir".
21. **Pantalla completa:** se pide en el mismo toque de "¡A la cancha!" (el navegador lo exige así). Si no se puede (en iOS Safari, por ejemplo), sigue igual.
