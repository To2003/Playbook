// Renderiza los dos videos y la miniatura con los mismos parámetros siempre.
// Uso: npm run render   (o node render.mjs)
// Usa el Chromium headless de Playwright si está instalado; si no, Remotion baja el suyo.
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

const chromePlaywright = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const navegador = process.env.REMOTION_CHROME ?? (existsSync(chromePlaywright) ? chromePlaywright : null);
const comunes = [...(navegador ? [`--browser-executable=${navegador}`] : []), "--concurrency=4"];
// H.264 en yuv420p (rango limitado: lo que esperan WhatsApp, Instagram e iOS) con pista de audio muda,
// así CapCut lo abre con su línea de audio lista para la música.
// Sin bt709, Remotion etiqueta el video como rango completo (yuvj420p).
const video = ["--codec=h264", "--crf=18", "--x264-preset=slow", "--pixel-format=yuv420p", "--color-space=bt709", "--enforce-audio-track"];

// Remotion no pisa un archivo que ya existe: se borran antes.
for (const f of ["out/playbook-trailer-9x16.mp4", "out/playbook-trailer-1x1.mp4", "out/miniatura.png"]) rmSync(f, { force: true });

const correr = (args) => execFileSync("npx", ["remotion", ...args, ...comunes], { stdio: "inherit" });
correr(["render", "src/index.ts", "Vertical", "out/playbook-trailer-9x16.mp4", ...video]);
correr(["render", "src/index.ts", "Cuadrado", "out/playbook-trailer-1x1.mp4", ...video]);
// La miniatura: la pizarra a pantalla completa con la bocha en el pase (frame 645, segundo 21,5).
correr(["still", "src/index.ts", "Cuadrado", "out/miniatura.png", "--frame=645"]);
