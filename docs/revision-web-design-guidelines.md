# Revisión con `web-design-guidelines` (M11)

Reglas: Vercel Web Interface Guidelines (`command.md`, bajado el 24/10/2026). Alcance: `src/app` y `src/components`.

## Corregido

| Archivo | Problema | Arreglo |
|---|---|---|
| `src/lib/editor/useEditor.ts`, `src/app/editor/page.tsx`, `src/app/boceto/page.tsx`, `src/components/Cabecera.tsx` | Se podía salir del editor o del boceto con cambios sin guardar | `beforeunload` mientras hay cambios y confirmación en el link de volver (probado en `e2e/boceto.mjs`) |
| `src/components/flujo/DivisionFlip.tsx:116` | `div` con `onClick` (saltear la animación) sin alternativa de teclado | Enter, Espacio o Escape también la saltean |
| `src/components/editor/PanelFicha.tsx`, editor y boceto | Placeholders sin `…`; campos de texto libre sin `name`/`autoComplete` | `…` al final y `autoComplete="off"` con `name` |
| `src/app/globals.css` | `<option>` nativo sin colores (Windows en tema oscuro) | `background-color` y `color` desde los tokens |
| `src/app/globals.css` | Títulos con nombres de usuario muy largos sin cortar | `overflow-wrap: anywhere` en `h1`–`h3` |
| `src/app/biblioteca/page.tsx`, `src/app/mis-ejercicios/page.tsx` | Lista de 68 filas sin virtualizar | `content-visibility: auto` con `contain-intrinsic-size` |
| `src/app/page.tsx`, `src/app/e/[id]/page.tsx` | Marca sin `translate="no"` | Agregado |
| `src/app/globals.css` | Botón principal y secundario sin estado hover en compu | Hover con tokens (`--lime-hover`, `--raised-hover`), solo con puntero fino |

## Ya cumplía

- `:focus-visible` global y en el botón principal; ningún `outline-none`.
- Sin `transition: all`; `prefers-reduced-motion` en CSS y en GSAP (pizarra en el paso final).
- `touch-action: manipulation`, `-webkit-tap-highlight-color` explícito, safe areas con `env()`.
- Botones de solo ícono con `aria-label`; íconos decorativos con `aria-hidden`.
- Avisos asincrónicos (exportar, compartir, sincronización) con `role="status"`/`aria-live`.
- Fechas y horas con `Intl.DateTimeFormat("es-AR")`.
- `color-scheme: dark` y `theme-color` igual al fondo.
- Borrar un ejercicio pide confirmación; en el editor, borrar se deshace con Ctrl+Z.
- Gestos con alternativa: "Dame otro" tiene botón; reordenar bloques tiene flechas; el editor mueve con flechas.
- Sin zoom bloqueado, sin `autoFocus`, sin GIFs, sin `<img>` (todo es SVG).

## No aplicado, a propósito

- **Title Case en títulos y botones:** es una regla del inglés. En castellano rioplatense va mayúscula solo al principio ("Armame la sesión").
- **Filtros de la biblioteca en la URL:** queda pendiente (ver REPORTE). No rompe nada; sirve para compartir una búsqueda.
