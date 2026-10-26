# Storyboard final: trailer de Playbook (30 s, 30 fps)

Formatos: `out/playbook-trailer-9x16.mp4` (1080 × 1920) y `out/playbook-trailer-1x1.mp4` (1080 × 1080). Mismo montaje y mismos tiempos; en el cuadrado, el celular va a la izquierda y el texto a la derecha.

## Escenas

| Tiempo | Cuadros | Imagen | Texto | Entrada |
|---|---|---|---|---|
| 0:00–0:03 | 0–89 | Negro; las líneas de la cancha se dibujan solas en tiza | Llegás a la cancha… | El texto ya está en el primer cuadro (es la vista previa del video) |
| 0:03–0:06 | 90–179 | Siguen las líneas y caen 7 fichas lima desordenadas, con rebote | …y vinieron 11, no 18. | Fichas escalonadas cada 5 cuadros |
| 0:06–0:10 | 180–299 | **Toma real**: ¿Cuántos vinieron?, cuatro toques en +, caen las fichas, se elige 1 arquero y aparece en el arco | Poné cuántos vinieron. | El celular sube desde abajo (270 ms) y entra el pasto |
| 0:10–0:13 | 300–389 | **Toma real**: ¿Qué armamos?, toque en Intermedio, en Media y en "Armame la sesión" | Elegí nivel e intensidad. | Zoom corto (240 ms) |
| 0:13–0:17 | 390–509 | **Toma real**: las fichas se separan en equipos (Flip) y los bloques entran como cartas repartidas | En segundos, tu sesión. | Zoom corto |
| 0:17–0:20 | 510–599 | **Toma real**: swipe de "Dame otro" sobre el primer bloque; entra otro ejercicio | ¿No te gusta? Dame otro. | Zoom corto |
| 0:20–0:24 | 600–719 | **Toma real**: la pizarra sale del celular y llena la pantalla; la bocha viaja por la línea de pase | Cada ejercicio, animado. | Zoom de la pizarra (300 ms) |
| 0:24–0:27 | 720–809 | **Toma real**: modo cancha, el cronómetro baja 00:03 → 00:00, destello y "¡Tiempo!" | Y en la cancha, el celu te marca los tiempos. | Barrido lateral (270 ms) |
| 0:27–0:30 | 810–899 | PLAYBOOK grande con el cuadrado lima, sobre la cancha | Beta para entrenadores · Pedí acceso: playbook.vercel.app | Logo con zoom suave; los textos entran 270 ms después |

Las tomas reales están grabadas de la app en producción con `?demo=1` (11 jugadores + 1 arquero, intermedio, media, 90 min, semilla fija). Van a velocidad real o un poco aceleradas (entre 1,1× y 1,16×) para entrar en el tiempo de cada escena; la pizarra y el modo cancha van a 1×.

## Golpes para la música

Todos los cortes caen en múltiplos de 0,5 s: con una pista de **120 BPM** que arranque en 0:00, cada corte cae en un tiempo (y 6, 10, 20 y 24 caen en comienzo de compás de 4/4).

| Tiempo | Golpe | Qué pasa |
|---|---|---|
| 0:00 | Arranque suave | Empiezan las líneas |
| 0:03 | Golpe | Caen las fichas |
| 0:06 | **Golpe fuerte** | Entra el celular: primera toma de la app |
| 0:10 | Golpe | ¿Qué armamos? |
| 0:13 | **Golpe fuerte** | Toque en "Armame la sesión" y las fichas se separan |
| 0:17 | Golpe | "Dame otro" |
| 0:17,75 | Acento | Se suelta el swipe y sale la carta |
| 0:20 | **Golpe fuerte** | La pizarra llena la pantalla |
| 0:24 | Golpe | Modo cancha (barrido) |
| 0:26,47 | **Acento fuerte** | Destello del fin de bloque: ideal para un silbato o un golpe seco |
| 0:27 | **Golpe final** | Logo |
| 0:29,5–0:30 | Cierre | Dejá que la música termine o haga fade out en el último medio segundo |

## Zona segura de Instagram (9:16)

Todo el texto queda entre y = 272 (títulos, medido: arrancan en y = 281) e y = 1193 (el cierre, medido en el cuadro final). Los 250 px de arriba y de abajo quedan libres de texto. El celular baja hasta y = 1874 (no es texto y no molesta si la interfaz de Instagram lo tapa un poco).
