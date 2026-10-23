# Playbook — reglas para cualquier sesión

Web app mobile-first para entrenadores de hockey sobre césped. Arma la sesión de entrenamiento según cuántos vinieron, el nivel y la intensidad, con ejercicios animados en una pizarra táctica.

@AGENTS.md (Next.js 16: leé la doc en `node_modules/next/dist/docs/` antes de usar una API que no conozcas).

## Fuentes de verdad
- **`SPEC.md`** define **qué hace** la app. El alcance del MVP está **congelado**.
  - No agregues funciones que no estén en el SPEC.
  - Si se te ocurre una, anotala en la sección "14. Backlog v2" del SPEC y seguí.
- **`DESIGN.md`** define **cómo se ve y se mueve** (tokens, tipografía, escala, radios, movimiento). Los tokens viven como variables CSS en `src/app/globals.css`; no hardcodees colores ni duraciones fuera de ahí.

## Orden de trabajo
- Construí en el orden de la sección 12 del SPEC.
- Al cerrar cada módulo:
  - lint y typecheck
  - tests del motor de generación
  - `review-animations` si el módulo tiene movimiento
  - capturas a 390 px
  - commit
- "Terminado" significa que los 11 criterios de aceptación del SPEC están verificados con evidencia (tests, capturas, prueba en modo avión). "Debería andar" no cuenta.

## Skills (cargalas con la herramienta Skill, no de memoria)

| Momento | Skills |
|---|---|
| Dirección de arte | `design-taste-frontend` (con el flujo de pantallas de app), `frontend-design`, `impeccable` → `DESIGN.md` |
| Plan | `writing-plans` |
| UI | `emil-design-eng`, `agent-skills:frontend-ui-engineering`, `vercel-react-best-practices` |
| Cada animación | `animate` |
| Pizarra y momentos firma | `gsap-*` si están instaladas; si no, la doc oficial de GSAP |
| Base de datos y auth | `supabase`, `supabase:supabase-postgres-best-practices` |
| Revisión | `review-animations` después de cada módulo con movimiento, `web-design-guidelines` al final |
| Antes de decir "listo" | `verification-before-completion`: capturas reales a 390 px y 1440 px |

## Dirección visual: "el pizarrón del vestuario a la noche, antes del partido"
- Táctico, nocturno y con energía de cancha. Es una herramienta que se usa con el silbato en la boca, no un dashboard corporativo.
- **Fondo:** casi negro con tinte azul profundo. Oscuro por defecto.
- **La cancha es el héroe visual:** césped sintético azul con textura sutil de fibra y líneas blanco tiza. Aparece en la pizarra, en las miniaturas y en el contador de jugadores.
- **Acento:** amarillo-lima flúo de peto, **solo** para la acción principal.
- **Fichas** (se distinguen también por forma o borde, no solo por color):
  - equipo A: lima, círculo lleno
  - equipo B: coral, con otra forma
  - comodín: blanco
  - arquero: amarillo con borde grueso
- **Tipografía:**
  - grotesca condensada y pesada, con números tabulares, para los números de marcador
  - sans limpia para el resto
- **Modo cancha:** alto contraste extremo, blanco sobre negro y tipografía gigante. Se tiene que leer a un metro, al sol. Nada decorativo.

### Prohibido
- degradés violeta/azul
- glassmorphism
- grillas de cards todas iguales
- shadcn sin adaptar
- emojis como íconos
- fotos de stock
- lorem ipsum
- landing de marketing (la app arranca en "Arrancar entrenamiento")
- sombras difusas por todos lados
- radios gigantes en todo

## Movimiento
- Cada animación guía, confirma o muestra un movimiento del ejercicio. Si no hace nada de eso, no va.
- UI: 150–300 ms. Gestos: resortes. Todo se puede interrumpir.
- Solo `transform` y `opacity`. Tiene que ir a 60 fps en un Android de gama media (probar con CPU throttling 4×).
- Las miniaturas se animan solo cuando están en pantalla (IntersectionObserver).
- Con `prefers-reduced-motion`: sin animación, y la pizarra se muestra en el paso final con sus trazos.
- Vibración con `navigator.vibrate` donde exista; en iOS cae en silencio.
- **GSAP para todo lo que se mueve** (pizarra y momentos firma). CSS para las microinteracciones. No sumes otra librería de animación.

## Stack
- Next.js (App Router), TypeScript y Tailwind (v4, tokens en `@theme`).
- Pizarra en SVG con coordenadas en metros (91,4 × 55) y `viewBox`.
- Dexie (IndexedDB) local-first, service worker para offline, Supabase (auth Google + sync).
- Deploy en Vercel Hobby. Nada que pida tarjeta.

## Textos
- Español rioplatense, con voseo y tono de vestuario. Corto, cercano y directo.
  - Ejemplos: "¿Cuántos vinieron hoy?", "Armame la sesión", "Dame otro", "¡A la cancha!", "Hidratación: dos minutos".
- Nada de "Usuario", "Enviar" ni textos de formulario corporativo.
- Terminología argentina de hockey: bocha, push, flick, barrida, revés, quite, conducción, área, línea de 23.
- Sin consejos médicos: ante dolor o lesión, el texto deriva a un profesional.
- Sin datos personales de jugadores.
