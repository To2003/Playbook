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
| `node e2e/feedback.mjs` | Formulario de feedback contra un Google Form simulado. Requiere el build con `NEXT_PUBLIC_FEEDBACK_FORM_URL` y `NEXT_PUBLIC_FEEDBACK_ENTRIES` de prueba (ver el encabezado del archivo) |
| `sh scripts/probar-rls.sh` | Corre la migración y las pruebas de RLS en un Postgres local (con `PGHOST`/`PGPORT`) |
| `npm run capturas` | Capturas de pantalla a 390 px |

## La cuenta (opcional)

Sin configurar nada, la app anda 100 % en el dispositivo: no hay login y "Compartir link" pide iniciar sesión. Para activar el login con Google, la sincronización y los links públicos, copiá `.env.example` a `.env.local` y seguí los pasos de la sección "Activar Supabase" de [`REPORTE.md`](REPORTE.md).

## Feedback

La beta tiene un formulario de feedback (Inicio → "Contanos qué onda", Mi club → "Mandar feedback", el cierre del modo cancha y "Este ejercicio está flojo" en cada ficha). Las respuestas van a un **Google Form**, que las guarda en una Google Sheet: sin backend y sin tarjeta.

1. En [forms.google.com](https://forms.google.com) creá un formulario nuevo, por ejemplo "Playbook · Feedback beta".
2. Agregá estas **10 preguntas, en este orden y ninguna obligatoria** (la app ya valida, y la calificación rápida del cierre viaja sola: si Google tiene alguna obligatoria, esa respuesta se pierde). En las de opciones, **los textos tienen que ser exactamente estos**: si una opción no coincide, Google descarta la respuesta entera sin avisar.

   | Campo | Pregunta | Tipo en Google Forms | Opciones (textuales) |
   |---|---|---|---|
   | `categorias` | ¿Qué categoría entrenás? | Casillas de verificación | `Menores`, `Juveniles`, `Mayores`, `Veteranos` |
   | `usos` | ¿Cuántas veces la usaste en la cancha? | Opción múltiple | `0`, `1`, `2–3` (con guion largo), `4 o más` |
   | `tal_cual` | ¿La sesión que te armó la usarías tal cual? | Escala lineal 1 a 5 | 1 = Ni loco, 5 = Tal cual |
   | `ejercicio_malo` | ¿Algún ejercicio te pareció malo o mal explicado? | Párrafo | |
   | `ejercicio` | ¿Cuál? | Respuesta corta | |
   | `falto` | ¿Qué te faltó? | Párrafo | |
   | `seguiria` | ¿La seguirías usando? | Opción múltiple | `Sí`, `No`, `Tal vez` |
   | `por_que` | ¿Por qué? | Párrafo | |
   | `contacto` | Tu nombre o apodo y club | Respuesta corta | |
   | `info` | Info técnica | Párrafo | (la llena la app: desde dónde, calificación del cierre, versión, dispositivo y contadores) |

   Si preferís columnas separadas para la info técnica, en vez de `info` podés crear preguntas de texto para `origen`, `calificacion`, `version`, `dispositivo`, `pwa`, `sesiones`, `cancha` y `propios`.

3. En **Configuración**, apagá "Recopilar direcciones de correo electrónico" y "Restringir a usuarios de…": tiene que poder responder cualquiera sin iniciar sesión.
4. En **Respuestas**, tocá "Vincular con Hojas de cálculo" para que todo caiga en una Sheet.
5. Sacá los `entry.XXXX`: menú de los tres puntos → **"Obtener vínculo prellenado"**. En cada pregunta de texto escribí **el nombre del campo** de la tabla (`ejercicio_malo`, `falto`, `info`…), marcá cualquier opción en las otras, tocá "Obtener vínculo" y "Copiar vínculo". (El script reconoce las de texto por el nombre; las de opciones, como `entry.123=Mayores`, se completan a mano en el JSON siguiendo el orden de la tabla.)
6. Convertí ese link en las dos variables:

   ```bash
   node scripts/feedback-entries.mjs "https://docs.google.com/forms/d/e/…/viewform?usp=pp_url&entry.…"
   ```

   Imprime `NEXT_PUBLIC_FEEDBACK_FORM_URL` (la misma dirección, terminada en `/formResponse`) y `NEXT_PUBLIC_FEEDBACK_ENTRIES` (el JSON con el `entry.XXXX` de cada campo). Si preferís hacerlo a mano: cada `entry.123=categorias` del link es `"categorias": "entry.123"`.
7. Pegalas en `.env.local` (ver `.env.example`) y en Vercel (*Settings → Environment Variables*, Production y Preview). Volvé a hacer el deploy: las variables se leen al compilar.
8. Opcional, el plan B: `NEXT_PUBLIC_FEEDBACK_WHATSAPP` con tu número (código de país, sin "+"). Si el Form no está configurado, "Mandar" abre WhatsApp con las respuestas escritas; si tampoco hay número, las copia al portapapeles.

Sin señal, la respuesta queda guardada en el celu y sale sola cuando vuelve la conexión. Con cada respuesta va info técnica (versión, dispositivo y navegador resumidos, si está instalada y contadores de uso), nada personal.

La app manda el POST con `mode: "no-cors"`: Google no deja leer la respuesta, así que se cuenta como enviado si el pedido sale. Para probar que llega, mandá uno de prueba y mirá la Sheet.

### Analytics

Con el deploy en Vercel se activa Vercel Web Analytics (sin cookies ni datos personales): activalo en el proyecto, en *Analytics*. Se registran `sesion_generada` (jugadores, nivel e intensidad), `modo_cancha_iniciado`, `modo_cancha_completado`, `dame_otro`, `ejercicio_creado`, `png_exportado` y `feedback_enviado`. Fuera de Vercel no se carga nada.

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
