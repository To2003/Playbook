# Trailer de Playbook

Video vertical de 30 s para invitar entrenadores a la beta, armado con [Remotion](https://www.remotion.dev) a partir de **tomas reales de la app**. Está separado de la app: tiene su propio `package.json` y no se compila con ella.

- `out/playbook-trailer-9x16.mp4`: 1080 × 1920, 30 fps, H.264, audio mudo (para WhatsApp, Reels e Historias)
- `out/playbook-trailer-1x1.mp4`: 1080 × 1080 (feed)
- `out/miniatura.png`: 1080 × 1080, para la vista previa del link
- Tiempos, textos y golpes para la música: [`STORYBOARD.md`](STORYBOARD.md)

## Cambiar el link o los textos y volver a renderizar

1. Editá [`config.ts`](config.ts): `TRAILER_LINK` (el link del cierre) y el `texto` de cada escena en `ESCENAS`.
2. Renderizá:

```bash
cd trailer
npm i
npm run render          # los dos videos y la miniatura → out/
```

`npm run render` corre estos tres comandos (útiles si querés uno solo):

```bash
npx remotion render src/index.ts Vertical out/playbook-trailer-9x16.mp4 --codec=h264 --crf=18 --x264-preset=slow --pixel-format=yuv420p --color-space=bt709 --enforce-audio-track
npx remotion render src/index.ts Cuadrado out/playbook-trailer-1x1.mp4 --codec=h264 --crf=18 --x264-preset=slow --pixel-format=yuv420p --color-space=bt709 --enforce-audio-track
npx remotion still  src/index.ts Cuadrado out/miniatura.png --frame=645
```

Remotion no pisa archivos que ya existen: borrá los de `out/` antes (el script lo hace solo). La primera vez Remotion baja su Chromium; si ya tenés uno, pasale `--browser-executable=<ruta>` o definí `REMOTION_CHROME`.

Para ver y ajustar el montaje en vivo: `npm run estudio` (abre Remotion Studio en el navegador).

## Volver a grabar las tomas

Solo hace falta si cambia la app. Las tomas están en `public/tomas/` junto con `marcas.json` (los momentos de cada toque); el montaje lee esas marcas, así que después de regrabar queda sincronizado solo.

```bash
# en la raíz del repo
npm run build && npm start -- -p 3100
# en otra terminal
cd trailer && node grabar.mjs http://localhost:3100
```

`grabar.mjs` abre la app con `?demo=1` (11 jugadores + 1 arquero, intermedio, media, 90 min, semilla fija: cada toma sale igual), simula los toques con un "dedo" visible y graba con el screencast de Chrome a 390 × 844 y 3× (1170 × 2532), remuestreado a 30 fps fijos.

## Estructura

```
config.ts          link, textos y duración de cada escena
src/Trailer.tsx    montaje: disposición 9:16 y 1:1, escenas y transiciones
src/piezas.tsx     cancha en tiza, pasto, celular en CSS y títulos
src/marca.ts       tokens de DESIGN.md y la fuente Archivo
grabar.mjs         graba las tomas reales con Playwright
render.mjs         renderiza los dos videos y la miniatura
public/tomas/      las tomas grabadas y sus marcas
```

Remotion es gratis para uso individual y equipos chicos; si Playbook pasa a ser de una empresa más grande, revisá su licencia.
