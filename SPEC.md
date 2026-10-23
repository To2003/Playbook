# Playbook — Especificación del MVP

> Web app mobile-first para entrenadores de hockey sobre césped. En la cancha, el entrenador saca el celu, pone cuántos vinieron, el nivel y la intensidad, y Playbook le arma la sesión con ejercicios animados en una pizarra táctica.
>
> **Este documento congela el alcance del MVP.** Lo que no está acá, no se hace en el MVP. Las ideas nuevas van a la sección "Backlog v2" y no se implementan hasta cerrar el MVP.

---

## 1. Resumen de decisiones

| Tema | Decisión |
|---|---|
| Nombre | **Playbook** |
| Público inicial | El autor y entrenadores conocidos que la prueban y dan feedback |
| Categorías | Menores (+10 años) a mayores. Modelo de datos preparado para sumar escuelita (5–9) en v2 |
| Modalidad | Solo hockey 11 |
| Ejes de configuración | **Nivel** (dificultad técnica) + **Intensidad** del día |
| Qué se genera | Sesión completa · Solo entrada en calor · Solo bloque principal |
| Duración | Se toma de "Mi club" y se cambia con un toque |
| Objetivo del día | Opcional, plegado en "Más opciones" |
| Arqueros | Se cuentan; si el ejercicio no los usa se les asigna una tarea paralela simple |
| Córner corto | Fuera del MVP |
| Físico | Solo dentro de la entrada en calor |
| Tips | Dentro de cada ejercicio: errores comunes + cómo corregirlos |
| Biblioteca base | ~60 ejercicios + 8 tareas de arquero |
| Contenido base | Mezcla: lo redacta el rol entrenador y lo revisa/ajusta el autor |
| Plantel | No. Solo se carga el número de presentes |
| Cuenta | Opcional. Sin cuenta todo queda en el dispositivo; con login (Google) se sincroniza |
| Compartir | Link público de solo lectura a un ejercicio (requiere login) |
| Exportar | Imagen PNG de la pizarra |
| Negocio | Gratis para siempre |
| Cuentas | Individuales (sin staff compartido) |
| Pizarra | Animación por pasos **incluida en el MVP** |
| Vistas de cancha | Completa, media cancha y área, con zoom y paneo |
| Boceto en celu | Fichas para arrastrar + flechas |
| Stack | Next.js + Supabase + Vercel, PWA |
| Offline | **Imprescindible**: sesión, biblioteca y ejercicios propios andan sin señal |
| Tema | Oscuro por defecto + modo cancha de alto contraste |
| Identidad | Única de la app (sin colores por club en el MVP) |
| Desarrollo | Todo el MVP completo, después se pule |

### Prioridades
- **P0 (sin esto la app no sirve):** generar la sesión, ver los ejercicios con su pizarra animada, modo cancha, offline.
- **P1 (el extra que la hace propia):** crear, editar y guardar ejercicios propios; compartir por link; exportar PNG.
- **P2 (si sobra tiempo dentro del MVP):** historial navegable, favoritos, filtros avanzados.

---

## 2. Usuarios y dispositivos

- **Entrenador** es el único rol del MVP.
- **📱 Celular (uso principal, en la cancha):** generar la sesión, modo cancha, biblioteca, boceto rápido y ajustes.
- **💻 Desktop (uso secundario, en casa):** editor completo de pizarra con animación por pasos, gestión de ejercicios propios y biblioteca en grilla.
- **Sin cuenta:** puede usar todo excepto compartir por link. Al hacer login, los datos locales se suben y se fusionan con la nube.

---

## 3. Flujo principal (celular)

**Regla de oro:** desde el inicio hasta la sesión generada hay **3 pantallas y menos de 15 segundos**.

### 3.1 Inicio
- Botón principal gigante: **"Arrancar entrenamiento"**.
- La última sesión generada, accesible con un toque ("Volver a la de hoy").
- Accesos secundarios: Biblioteca, Mis ejercicios, Mi club.

### 3.2 Pantalla 1 — "¿Cuántos vinieron?"
- Número grande de **jugadores de campo** con botones – / + (mínimo 48 px, cómodos con el pulgar).
- Rango soportado: **4 a 30** jugadores de campo.
- Toggle de **arqueros: 0 · 1 · 2**.
- Valores iniciales: los de la última sesión.

### 3.3 Pantalla 2 — "¿Qué armamos?"
- **Tipo:** Sesión completa · Entrada en calor · Principal.
- **Nivel:** Inicial · Intermedio · Avanzado.
- **Intensidad:** Suave · Media · Fuerte.
- **Duración:** un chip con el valor de "Mi club"; al tocarlo se cambia.
  - Sesión completa: 60 / 75 / 90 / 120
  - Entrada en calor: 15 / 20 / 25 / 30
  - Principal: 30 / 45 / 60
- **Más opciones** (plegado):
  - objetivo del día
  - espacio disponible
  - material de hoy (pisa el de "Mi club")
- Botón **"Armar"**.

### 3.4 Pantalla 3 — Sesión generada
- Línea de tiempo vertical de bloques. Cada bloque muestra:
  - fase
  - duración
  - nombre del ejercicio
  - **pizarra en miniatura animada**
  - división del grupo (ej.: "11 → 2 equipos de 5 + 1 comodín")
  - si hay arqueros sin uso, su tarea paralela
- Acciones por bloque:
  - **swipe lateral = "dame otro"** (otro ejercicio de la misma fase que cumpla los filtros)
  - ajustar la duración con ±
  - reordenar arrastrando
  - abrir la ficha
- El tiempo total se recalcula en vivo.
- Botones: **"Empezar" (→ modo cancha)** y "Guardar para después".

### 3.5 Modo cancha
- Pantalla completa, alto contraste, tipografía grande, legible al sol.
- Muestra:
  - bloque actual
  - **pizarra grande en loop**
  - 3 puntos clave
  - división del grupo
  - **cronómetro regresivo del bloque**
- Al terminar el bloque: vibración + aviso visual, y botón grande "Siguiente".
- Pausa de hidratación sugerida de 2 min después del bloque 2 y del 3 (incluida en los tiempos).
- La pantalla se mantiene encendida (Screen Wake Lock API, con fallback silencioso).
- Funciona en vertical y en horizontal.

---

## 4. Motor de generación (reglas, sin IA)

### 4.1 Estructura de la sesión completa
| Bloque | Fase | 60' | 75' | 90' | 120' |
|---|---|---|---|---|---|
| 1 | Entrada en calor sin bocha | 8 | 10 | 10 | 12 |
| 2 | Entrada en calor con bocha | 12 | 12 | 15 | 18 |
| 3 | Principal técnico/táctico | 20 | 25 | 30 (2 ej.) | 45 (2 ej.) |
| 4 | Juego aplicado/reducido | 15 | 22 | 28 | 35 (2 ej.) |
| 5 | Vuelta a la calma | 5 | 6 | 7 | 10 |

- "Entrada en calor" genera los bloques 1 y 2; "Principal" genera los bloques 3 y 4.
- Para duraciones libres, los tiempos se reparten proporcionalmente.

### 4.2 Filtros por bloque (en orden)
1. **Fase** del bloque.
2. **Jugadores:** el número de presentes entra en el rango del ejercicio, o el ejercicio se puede escalar (ver 4.4).
3. **Nivel:** el ejercicio soporta el nivel elegido.
4. **Arqueros:** si el ejercicio los *requiere* y hay 0, se excluye salvo que admita arco chico.
5. **Material y espacio:** el ejercicio no pide más de lo disponible.
6. **Objetivo** (si se eligió): se priorizan los ejercicios con ese objetivo en los bloques 3 y 4.
7. **No repetir:** se evitan los ejercicios usados en las últimas 3 sesiones cuando hay alternativas.

### 4.3 Intensidad
- Cada ejercicio tiene intensidad 1, 2 o 3.
- **Suave:** bloques 3 y 4 con ejercicios de intensidad ≤ 2; el bloque 4 dura 20% menos y el cierre se alarga con ese tiempo.
- **Media:** sin restricción, con preferencia por intensidad 2.
- **Fuerte:** se priorizan ejercicios de intensidad 3 en los bloques 3 y 4, y la entrada en calor total **nunca baja de 15 min**.
- Siempre: la intensidad sube y después baja. Nunca va un ejercicio de intensidad 3 pegado al cierre si se puede evitar.

### 4.4 Escalado por cantidad de jugadores
Cada ejercicio declara un **formato**. El motor divide al grupo según ese formato y muestra la división en texto y en la pizarra.

| Formato | Regla |
|---|---|
| Individual con bocha | Todos a la vez; se indica el espacio por jugador |
| Parejas | N par → N/2 parejas; impar → una terna |
| Grupos de k | Grupos de k; el resto se reparte sumando +1 a algunos grupos |
| Dos equipos | N par → N/2 vs N/2; impar → **comodín** que juega con el que ataca |
| Superioridad (ej. 3v2) | Se repite la célula tantas veces como entre; los que sobran rotan entrando por el que sale |
| Estaciones | Si N supera el máximo del ejercicio, se divide en estaciones con rotación cada X min |

- **Arqueros sin uso:** se les asigna una tarea paralela de la biblioteca de arqueros (8 tareas).
- **Menos de 4 jugadores:** solo se generan ejercicios individuales de técnica.

### 4.5 "Dame otro"
- Toma el siguiente candidato que cumple los mismos filtros, sin repetir los que ya se mostraron en esa sesión.
- Si no hay más candidatos, avisa ("No tengo otro para 7 en intermedio") y ofrece relajar un filtro.

---

## 5. Ejercicios

### 5.1 Ficha del ejercicio
| Campo | Obligatorio | Notas |
|---|---|---|
| Nombre | ✅ | |
| Fase | ✅ | calor_sin_bocha · calor_con_bocha · principal · aplicado · vuelta_calma |
| Jugadores mín/máx | ✅ | Jugadores de campo |
| Formato | ✅ | Ver 4.4 |
| Pizarra | ✅ | Al menos 1 paso |
| Niveles soportados | — | Por defecto los tres |
| Intensidad (1–3) | — | Por defecto 2 |
| Arqueros | — | no · opcional · requerido · admite arco chico |
| Objetivos | — | conducción, pase y recepción, definición, quite y marca, salida, presión, posesión, transición |
| Categorías | — | menores, juveniles, mayores (preparado para escuelita) |
| Espacio | — | completa, media, cuarto, área |
| Material | — | bochas, conos/platos, vallas, aros, arcos chicos, colores de petos |
| Duración sugerida | — | Mín y máx en minutos |
| Organización | — | Cómo se arma |
| Desarrollo / consigna | — | |
| Puntos clave | — | Hasta 3 |
| Errores comunes | — | Cada uno con **cómo corregirlo** (son los tips) |
| Variantes por nivel | — | Qué cambia en inicial / intermedio / avanzado |
| Progresión | — | Más fácil / más difícil |

### 5.2 Biblioteca base (~60 + 8)
| Fase | Cantidad | Contenido |
|---|---|---|
| Entrada en calor sin bocha | 10 | Movilidad, activación, coordinación, agilidad y cambios de ritmo (el físico vive acá) |
| Entrada en calor con bocha | 14 | Conducción, pase y recepción en movimiento, combinaciones derecho/revés |
| Principal técnico/táctico | 14 | Push, barrida/slap, flick, revés, recepción orientada, quite, conducción con oposición, definición |
| Juego aplicado/reducido | 14 | Rondos, superioridades (2v1, 3v2, 4v3), juegos reducidos con condicionantes, salida, presión |
| Vuelta a la calma | 8 | Elongación, juegos de baja intensidad, cierre |
| **Tareas de arquero** | 8 | Trabajo paralelo simple (desplazamientos, reacción, despejes) |

- Todo ejercicio base tiene su pizarra animada.
- Todo ejercicio base tiene sus 3 puntos clave y al menos 2 errores comunes con su corrección.
- Entre todos tienen que cubrir de **4 a 30 jugadores** y los tres niveles en cada fase.
- Terminología argentina de hockey: bocha, push, flick, barrida, revés, quite, conducción, área, línea de 23.

### 5.3 Ejercicios propios
- Se crean desde cero o **duplicando** uno base.
- Son privados por defecto.
- Si tienen fase y rango de jugadores, **entran al motor de generación** igual que los base. Los propios tienen prioridad leve si el entrenador los marcó como favoritos.
- Estados: **borrador** (boceto rápido desde el celu) y **listo**.

---

## 6. Pizarra táctica

### 6.1 Cancha
- Cancha de hockey 11 a escala real: **91,4 × 55 m**.
- Marcas:
  - líneas de 23 m
  - línea central
  - **áreas de 14,63 m**
  - **línea punteada a 5 m del área**
  - punto penal (6,40 m)
  - marcas de córner corto en la línea de fondo
  - arcos de 3,66 m
- Coordenadas internas **en metros**, para que se renderice igual en cualquier tamaño.
- **Vistas:** completa, media cancha y área, con zoom de pellizco/rueda y paneo.

### 6.2 Elementos
- Jugadores de equipo A, equipo B y comodín, con número o letra
- Arquero
- Bocha
- Conos/platos, vallas, aros, arco chico
- Zona (rectángulo o elipse semitransparente)
- Texto corto

### 6.3 Trazos (lenguaje estándar)
| Trazo | Significado |
|---|---|
| Línea sólida con flecha | Desplazamiento sin bocha |
| Línea ondulada con flecha | Conducción |
| Línea punteada con flecha | Pase |
| Línea gruesa con flecha | Tiro al arco |

### 6.4 Animación por pasos
- Un ejercicio es una secuencia de **pasos** (máximo 12).
- Cada paso guarda la posición de cada elemento y los trazos que llevan al paso siguiente.
- La reproducción interpola entre pasos:
  - en el **pase**, la bocha viaja por la línea punteada
  - en la **conducción**, el jugador y la bocha viajan juntos por la línea ondulada
  - en el **desplazamiento**, el jugador recorre su trazo
- Controles: play/pausa, velocidad 0.5× · 1× · 2×, loop, paso anterior/siguiente.
- **Miniaturas:** solo se animan cuando están visibles en pantalla. Con `prefers-reduced-motion` se muestran estáticas, en el paso final con los trazos.

### 6.5 Editor
- **Desktop (completo):**
  - arrastrar y soltar desde una paleta
  - selección múltiple
  - duplicar
  - alinear
  - deshacer/rehacer
  - atajos de teclado
  - **timeline de pasos** abajo, para agregar, duplicar, reordenar y borrar pasos y ajustar la duración de cada uno
  - panel lateral con la ficha
- **Celular (boceto rápido):**
  - fichas para arrastrar y flechas
  - un solo paso
  - nombre y fase
  - se guarda como **borrador** para completarlo en desktop
- **Exportar PNG:** la pizarra (paso final con trazos) más el nombre del ejercicio y la marca Playbook.

---

## 7. Mi club (ajustes)
- Duración por defecto de cada tipo
- Espacio habitual
- Material habitual
- Categoría habitual
- Cuenta: login/logout con Google y estado de sincronización
- Tema: oscuro (por defecto) / claro

---

## 8. Compartir
- Desde un ejercicio (propio o base): **"Compartir link"** genera una URL pública `/e/[id]`.
- La página pública muestra la pizarra animada y la ficha, en solo lectura, con un botón "Usalo en Playbook" que lo duplica a la biblioteca de quien lo abre.
- Requiere login, porque el ejercicio tiene que estar en la nube.

---

## 9. Datos y arquitectura

### 9.1 Stack
- **Next.js** (App Router) desplegado en **Vercel** (plan Hobby).
- **Supabase** para auth (Google), Postgres y Row Level Security, en plan gratis y sin tarjeta.
- **PWA:** service worker, manifest, instalable.
- **Local-first:** IndexedDB (por ejemplo Dexie) como fuente de verdad en el dispositivo, con cola de sincronización contra Supabase cuando hay login y señal.
- La biblioteca base viaja **empaquetada en la app** (JSON) para funcionar offline desde la primera carga.

### 9.2 Entidades
- **Exercise:** campos de 5.1 + `pizarra` + `autor` (`base` | userId) + `estado` (borrador | listo) + `favorito` + `compartido`.
- **Pizarra:** `vista`, `elementos[]` (id, tipo, equipo, etiqueta) y `pasos[]` (duración, posiciones por elemento en metros, trazos[]).
- **Session:**
  - fecha
  - jugadores, arqueros
  - tipo, nivel, intensidad, duración
  - objetivo
  - `bloques[]` (fase, ejercicioId, duración, división calculada, tarea de arquero)
- **ClubSettings:** valores de la sección 7.

### 9.3 Reglas
- Sin datos personales de jugadores en ningún lado.
- Sin consejos médicos: ante dolor o lesión, el texto siempre deriva a un profesional.
- Los ejercicios propios solo los ve su autor (RLS), salvo los marcados como compartidos.

---

## 10. UX, diseño y calidad

- **Mobile-first** desde 360 px de ancho. Todo se puede hacer con una mano.
- Áreas táctiles de al menos 48 px.
- Tema **oscuro** por defecto; **modo cancha** de alto contraste para usar al sol.
- Animaciones con propósito: guían, confirman y muestran movimiento. Nada decorativo en modo cancha. Se respeta `prefers-reduced-motion`.
- Textos en **español rioplatense informal** (vos, che), cercano y con tono de vestuario.
- Rendimiento:
  - respuesta a la interacción en menos de 100 ms
  - generar la sesión en menos de 300 ms
  - carga inicial en menos de 3 s en 4G
- Soporte: Chrome Android y Safari iOS (las dos últimas versiones mayores); desktop en Chrome, Firefox y Safari.
- Accesibilidad: contraste AA mínimo y foco visible en desktop.
- La dirección visual y de animación concreta se define en la Fase 2 (prompt de construcción).

---

## 11. Criterios de aceptación del MVP

1. Desde el inicio, con el celu, se genera una sesión completa en **3 pantallas y menos de 15 segundos**.
2. Con 7, 11, 13 y 22 jugadores, con 0 y con 2 arqueros, la sesión generada es válida: la división del grupo es correcta y ningún arquero queda sin tarea.
3. Cambiar nivel o intensidad cambia los ejercicios elegidos, no solo la etiqueta.
4. "Dame otro" nunca repite un ejercicio dentro de la misma sesión.
5. En **modo avión**, con la app ya instalada, se puede generar una sesión, usar el modo cancha, ver la biblioteca y crear un boceto.
6. Los ~60 ejercicios base y las 8 tareas de arquero tienen la ficha completa y la pizarra animada.
7. En desktop se crea un ejercicio de 5 pasos, se guarda y aparece animado en el celu después de sincronizar.
8. Un ejercicio propio con fase y rango de jugadores aparece en las sesiones generadas.
9. El link compartido se abre sin login y reproduce la animación.
10. El PNG exportado se ve bien al mandarlo por WhatsApp.
11. En modo cancha la pantalla no se apaga y el fin de bloque avisa con vibración y aviso visual.

---

## 12. Orden de construcción
Aunque se entrega el MVP completo, el agente construye en este orden y verifica cada módulo antes de seguir:
1. Base del proyecto: Next.js, PWA, IndexedDB, tema y layout mobile.
2. Modelo de datos + biblioteca base en JSON (empezando por 10 ejercicios de muestra; el resto se completa después).
3. Render de la pizarra (cancha, elementos, trazos) + reproductor de pasos.
4. Motor de generación + flujo de 3 pantallas.
5. Modo cancha.
6. Biblioteca y ficha.
7. Editor desktop + boceto mobile.
8. Supabase: auth, sincronización, compartir por link.
9. Exportar PNG.
10. Completar los ~60 ejercicios y las tareas de arquero.

---

## 13. Fuera de alcance del MVP
- Córner corto (jugadas y módulo propio)
- Bloques de preparación física aparte
- Hockey 5s e indoor
- Escuelita (5–9 años)
- Plantel, nombres de jugadores y asistencia
- Staff o cuentas compartidas por club
- Colores personalizados por club
- Biblioteca comunitaria pública
- Exportar GIF o video
- IA para generar ejercicios
- Planificación semanal o de temporada
- Estadísticas de partido o análisis de video
- Pagos, chat, red social

## 14. Backlog v2 (no tocar hasta cerrar el MVP)
- Escuelita con ejercicios lúdicos
- Córner corto
- Plantel con asistencia
- Exportar GIF/MP4 de la pizarra
- Generación asistida por IA ("armame algo para presión alta con 9")
- Staff de club con biblioteca compartida
- Colores del club
- Hockey 5s
