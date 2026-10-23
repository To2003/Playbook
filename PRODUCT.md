# Product

<!-- impeccable:product-schema 1 -->

> Escrito a partir de `SPEC.md` y del prompt de construcción del autor. No hubo una entrevista aparte: el autor pidió una sola pausa, en las capturas estáticas. Lo que no sale de esas dos fuentes está marcado como *supuesto*.

## Platform

web

## Stack

Fijado por el autor: Next.js (App Router) + TypeScript + Tailwind, GSAP para el movimiento, Dexie (IndexedDB) local-first, service worker, Supabase (auth con Google + sync) y deploy en Vercel Hobby. PWA instalable.

## Users

- Entrenadores y entrenadoras de hockey sobre césped de clubes argentinos, de menores (+10 años) a mayores.
- Usan la app **parados en la cancha, con el celu en una mano** y muchas veces al sol, minutos antes o durante el entrenamiento. Saben cuántos vinieron recién cuando llegan.
- En casa, desde la compu, arman y editan sus propios ejercicios con más calma.
- Público inicial: el autor y entrenadores conocidos que la prueban y dan feedback.

## Product Purpose

Que el entrenador pase de "vinieron 13 y uno de los arqueros" a una sesión completa, con ejercicios que entran en esa cantidad de gente y con cada ejercicio mostrado en una pizarra animada, en tres pantallas y menos de 15 segundos. Después la conduce desde el celu en modo cancha.

Éxito = la usa en la cancha en lugar de improvisar o de llevar la planilla en papel.

## Positioning

El motor parte de **la cantidad real de presentes**, no de un plan ideal. Divide al grupo según el formato de cada ejercicio (parejas, equipos más un comodín, células de superioridad, estaciones), les da tarea a los arqueros que no se usan y muestra esa división en la propia pizarra. Todo funciona sin señal.

## Operating Context

- Cancha de sintético (azul), con luz de día o de noche, y a veces sin señal.
- Antes de empezar se cuentan los presentes. Durante la sesión hay bloques con tiempo, pausas de hidratación y rotaciones.
- Material típico: bochas, conos y platos, vallas, aros, arcos chicos y petos de colores.
- Vocabulario: bocha, push, flick, barrida, revés, quite, conducción, área, línea de 23, comodín, arquero.

## Capabilities and Constraints

- Ver el SPEC completo. El alcance del MVP está congelado.
- Rango: de 4 a 30 jugadores de campo y de 0 a 2 arqueros. Solo hockey 11.
- Offline imprescindible. Sin datos personales de jugadores. Sin consejos médicos.
- Gratis, cuentas individuales y login opcional.

## Brand Commitments

- Nombre: **Playbook**.
- Voz: español rioplatense, con voseo y tono de vestuario. Corta, cercana y directa ("Armame la sesión", "Dame otro", "¡A la cancha!").
- La dirección visual la fijó el autor: "el pizarrón del vestuario a la noche, antes del partido". Los detalles están en `CLAUDE.md` y `DESIGN.md`.
- Una sola identidad, sin colores por club.

## Evidence on Hand

- No hay fotos, logos de clubes, testimonios ni métricas. **No se inventan.**
- El contenido de los ejercicios lo redacta el rol entrenador y lo revisa el autor. Todo ejercicio es material de muestra hasta esa revisión.

## Product Principles

1. **La cancha manda.** Cada decisión se prueba con una mano, al sol y con el silbato en la boca.
2. **Mostrar antes que explicar.** La división del grupo y el movimiento del ejercicio se ven en la pizarra antes de leerlos.
3. **Tres toques a la sesión.** Nada se interpone entre "¿cuántos vinieron?" y "¡A la cancha!".
4. **Sin señal no pasa nada.** Lo esencial anda offline desde la primera carga.

## Accessibility & Inclusion

- Contraste AA mínimo. En modo cancha, contraste extremo.
- Áreas táctiles de al menos 48 px y uso con una mano.
- Las fichas se distinguen por forma, no solo por color (sol, daltonismo).
- Se respeta `prefers-reduced-motion`.
