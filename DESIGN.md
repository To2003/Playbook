---
name: Playbook
description: El pizarrón del vestuario a la noche, antes del partido.
colors:
  ground: "#070B12"
  surface: "#0E1520"
  raised: "#172235"
  line: "#1F2B3E"
  ink: "#F2F5F8"
  ink-muted: "#A9B4C4"
  ink-faint: "#8390A5"
  lime: "#D2FA45"
  on-lime: "#0A1004"
  coral: "#FF7059"
  wildcard: "#F4F4EE"
  keeper: "#3FDCFF"
  keeper-edge: "#0A1004"
  turf: "#1D5DAA"
  turf-stripe: "#1A549B"
  turf-runoff: "#143F74"
  turf-fiber-light: "#2C6EBF"
  turf-fiber-dark: "#164A8C"
  chalk: "#EEF3F1"
  cone: "#FF9A1F"
  danger: "#FF6B6B"
  pitch-ground: "#000000"
  pitch-ink: "#FFFFFF"
  pitch-muted: "#D2D2D2"
typography:
  scoreboard-xl:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "9rem"
    fontWeight: 800
    lineHeight: 0.82
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 62"
    fontFeature: "'tnum'"
  scoreboard-l:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 800
    lineHeight: 0.85
    fontVariation: "'wdth' 62"
    fontFeature: "'tnum'"
  scoreboard-m:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
    lineHeight: 0.9
    fontVariation: "'wdth' 62"
    fontFeature: "'tnum'"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 70"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 650
    lineHeight: 1.25
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.3
  meta:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.3
rounded:
  chip: "4px"
  card: "8px"
  pitch: "6px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
components:
  button-primary:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.on-lime}"
    rounded: "{rounded.card}"
    height: "64px"
  button-secondary:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    height: "56px"
  stepper-button:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    size: "72px"
  segment:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.card}"
    height: "56px"
  segment-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
  block-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px"
  pitch-button:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.on-lime}"
    rounded: "{rounded.card}"
    height: "88px"
---

# Design System: Playbook

## Overview

**Creative North Star: "El pizarrón del vestuario a la noche, antes del partido"**

Playbook es una herramienta de cancha. La pantalla es de noche: un negro con tinte azul profundo, como el vestuario con la luz apagada. Lo único que brilla es la **cancha de sintético azul** con sus líneas de tiza y el **peto lima** de la acción que hay que tocar. La cancha no es una ilustración de fondo: es la pizarra donde se ve todo. Dónde va cada ficha, cómo se divide el grupo y por dónde viaja la bocha.

La app es para operar, no para persuadir. La estructura usa patrones que el entrenador ya conoce (barra superior, botón de volver, listas, segmentados y botones grandes) y la identidad vive en cuatro cosas:
- la tipografía de marcador
- la cancha
- el lima del peto
- el movimiento de las fichas

La densidad es baja y los toques son grandes, porque se usa con una mano.

**Key Characteristics:**
- Un solo acento, el lima, y solo en la acción principal de cada pantalla.
- Los números importantes (presentes, minutos, cronómetro) van en grotesca extra condensada de marcador, con cifras tabulares.
- La cancha aparece en la pizarra, en las miniaturas, en el contador de jugadores y en el inicio.
- Superficies planas que se separan por pasos de luminosidad, sin sombras en reposo.
- **Modo cancha:** negro puro y blanco puro. Lo único que se mueve es la pizarra.

## Colors

La paleta es restringida: neutrales fríos de noche, el lima del peto y los colores de las fichas. El color que lleva información vive en la cancha, no en la interfaz.

### Primary
- **Lima peto** (#D2FA45): el botón de la acción principal, uno por pantalla ("Arrancar entrenamiento", "Seguir", "Armame la sesión", "¡A la cancha!", "Siguiente"). También es el color del equipo A en la pizarra, que es el mismo peto. Fuera de esos dos usos no aparece.
- **Tinta sobre lima** (#0A1004): el texto encima del lima. El contraste es de 16:1.

### Fichas (la pizarra)
- **Equipo A, lima** (#D2FA45): círculo lleno.
- **Equipo B, coral** (#FF7059): cuadrado de esquinas apenas redondeadas.
- **Comodín, blanco tiza** (#F4F4EE): rombo.
- **Arquero, cian** (#3FDCFF): círculo con borde grueso oscuro (#0A1004) y un anillo exterior cian. Antes era amarillo (#FFCF2E), pero en la prueba de brillo alto (`capturas/contraste/`) se confundía con el equipo A lima. El cian no choca con el lima, el coral, el blanco ni el naranja de los conos, y el borde oscuro lo separa del sintético azul.
- **Cono/plato** (#FF9A1F): triángulo chico.

La forma lleva el significado, y el color lo refuerza. Una captura en escala de grises tiene que seguir siendo legible.

### Cancha
- **Sintético azul** (#1D5DAA), con franjas de corte alternadas (#1A549B) cada 9,14 m.
- **Zona exterior** (#143F74): el sintético más allá de los 2,5 m de seguridad. Se ve cuando una miniatura hace zoom a la jugada.
- **Fibra** (#2C6EBF / #164A8C): trazos cortos de baja opacidad en un `<pattern>` SVG. Es textura sutil, no ruido animado.
- **Tiza** (#EEF3F1): todas las líneas de la cancha y todos los trazos del ejercicio.

### Neutral
- **Vestuario** (#070B12): el fondo de la app. Es casi negro con tinte azul, como pide el brief, pero no llega a navy.
- **Superficie** (#0E1520): las tarjetas de bloque, los segmentados y la barra inferior.
- **Elevado** (#172235): los botones secundarios, los steppers y el segmento en hover.
- **Línea** (#1F2B3E): un separador de 1 px, solo donde una lista lo necesita.
- **Tinta** (#F2F5F8): el texto principal. **Tinta apagada** (#A9B4C4): el texto secundario, a 9:1. **Tinta tenue** (#8390A5): los metadatos, a 5,6:1 sobre la superficie.

### Modo cancha
- **Negro** (#000000), **blanco** (#FFFFFF) y **gris claro** (#D2D2D2) para los secundarios.
- La pizarra pasa a negro con tiza blanca, y las fichas conservan sus colores.

### Named Rules
**La regla del peto.** El lima es la acción principal y el equipo A, nada más. Si en una pantalla hay dos cosas lima en la interfaz (fuera de la pizarra), una sobra.

**La regla de la escala de grises.** Ninguna ficha se distingue solo por el color.

## Typography

**Familia única:** Archivo, variable con ejes `wdth` (62–125) y `wght`, servida desde la app con `next/font`.

**Carácter:** Archivo extra condensada y pesada (wdth 62, wght 800) es la tipografía del marcador y de la camiseta. En ancho normal es una grotesca limpia que se lee bien al sol. Son dos voces de una misma familia: un solo archivo de fuente, que es bueno para el offline.

### Hierarchy
- **Marcador XL** (800, wdth 62, 9rem/144 px, lh .82, tnum): la cantidad de jugadores.
- **Marcador L** (800, wdth 62, 4.5rem/72 px; 7.5rem/120 px en modo cancha, tnum): el cronómetro y el total de la sesión.
- **Marcador M** (800, wdth 62, 2.5rem/40 px, tnum): los minutos de cada bloque.
- **Headline** (800, wdth 70, 2rem/32 px): la pregunta de cada pantalla ("¿Cuántos vinieron hoy?"). Tiene que entrar en dos líneas a 360 px.
- **Title** (650, 1.125rem/18 px): el nombre del ejercicio y los títulos de bloque.
- **Body** (400, 1rem/16 px, lh 1.45): el texto corrido, con 16 px como mínimo porque se lee al sol. Medida de 65ch como máximo.
- **Label** (500, 0.875rem/14 px): la fase, la división del grupo y las etiquetas de control.
- **Meta** (400, 0.8125rem/13 px): datos secundarios.

### Named Rules
**La regla del marcador.** La grotesca condensada se usa solo para números y para la pregunta de cada pantalla. Botones, etiquetas y texto van en ancho normal.

**Sin mayúsculas sostenidas.** Todo en sentence case, sin etiquetas espaciadas en caja alta.

## Layout

- Mobile-first desde 360 px, con un margen lateral de 16 px y una columna única.
- La acción principal vive en la **zona del pulgar**: en una barra inferior fija con safe-area, o como último elemento del primer viewport.
- Ritmo de 4 px. Separación de 8–12 px dentro de un grupo y de 24–32 px entre secciones.
- Desktop (≥1024 px): la columna del flujo se centra a 480 px. La biblioteca y el editor se definen en sus módulos, con el mismo sistema.
- **Modo cancha:**
  - En vertical: cronómetro arriba, pizarra al centro y puntos clave con el botón abajo.
  - En horizontal: la pizarra a la izquierda y el cronómetro con los puntos a la derecha.

## Elevation & Depth

Plana por defecto. La profundidad se da por pasos de luminosidad (vestuario → superficie → elevado), no por sombras. Lo único que lleva sombra es lo que realmente flota: la carta que se arrastra en "dame otro" y la ficha que se arrastra en el editor, con `0 12px 24px -8px rgba(0,0,0,.6)` y solo mientras están en la mano.

## Shapes

- Radios chicos: 4 px en chips y 8 px en tarjetas y botones. La cancha lleva 6 px en su recorte exterior. No hay pills ni radios grandes.
- Los botones ± son cuadrados de 72 px con radio de 8 px.
- La cancha conserva sus proporciones reales (91,4 × 55 m). El editor usa las vistas oficiales (completa, media y área). Las miniaturas y el modo cancha hacen zoom a donde pasa la jugada, con una proporción fija (16:9 en las tarjetas y 1,7 en modo cancha).
- La cancha completa va acostada. La media cancha y el área van paradas, con el arco arriba.

## Components

- **Botón principal:** lima, 64 px de alto (88 px en modo cancha), texto de 18 px a peso 700. Al apretarlo baja a `scale(.97)` en 150 ms.
- **Botón secundario:** elevado y del mismo alto que el principal.
- **Stepper ±:** 72 × 72 px, con glifo dibujado en SVG (nunca un "+" tipográfico suelto) y repetición si se mantiene apretado.
- **Segmentado:** 56 px de alto. La opción seleccionada se invierte (tinta sobre fondo claro) y se mueve un indicador. El lima no va en los segmentados.
- **Tarjeta de bloque:** en superficie, con un riel de tiempo a la izquierda (minuto de inicio en marcador), la fase en label, el nombre en title, la miniatura de la pizarra y la división del grupo.
- **Íconos:** SVG propios de trazo 2 px, sin emojis.
- **Foco visible:** un anillo de 2 px en tinta con offset de 2 px. En los elementos lima, el anillo va en tinta oscura.
- **Selección de texto:** lima con tinta oscura.

## Motion

- **Tokens:**
  - `--dur-fast` 150 ms (prensado y hover)
  - `--dur-base` 220 ms (cambios de estado)
  - `--dur-slow` 300 ms (entradas)
  - `--ease-out` cubic-bezier(.23, 1, .32, 1)
  - `--ease-in-out` cubic-bezier(.77, 0, .175, 1)
- Los gestos y los momentos firma van con GSAP. Usan resortes para el gesto y `power`/`expo` out para la UI, y siempre se pueden interrumpir.
- Solo `transform` y `opacity`.
- Con `prefers-reduced-motion` no hay traslados, y la pizarra se muestra en su paso final con los trazos.

## Do's and Don'ts

**Do**
- Mostrar la división del grupo en la cancha antes de escribirla.
- Usar números de marcador para todo lo que se cuenta o se cronometra.
- Dejar una sola acción lima por pantalla.

**Don't**
- Degradés, glass, sombras en reposo, radios grandes, emojis, fotos de stock o lorem.
- Una grilla de tarjetas iguales como estructura.
- Lima en tabs, chips, navegación o decoraciones.
- Texto bajo 13 px, ni siquiera en las miniaturas: las miniaturas no llevan texto.
