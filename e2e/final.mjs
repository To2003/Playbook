// Verificación final (M11) contra el build de producción: BASE=http://localhost:3100 node e2e/final.mjs
// 1. Flujo completo a 390 × 844 y 1440 × 900, con el tiempo del criterio 1 y las capturas clave.
// 2. Offline: service worker activo → setOffline(true) → generar sesión, modo cancha, biblioteca y boceto.
// 3. Video de los 5 momentos firma en capturas/final/ (screencast de CDP → WebM; ver `grabar`).
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";

const base = process.env.BASE ?? "http://localhost:3100";
const salida = "capturas/final";
mkdirSync(salida, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium" });
const resultado = { flujo: {}, offline: {}, videos: [] };
const fallas = [];
const ok = (cond, msg) => {
  if (!cond) {
    fallas.push(msg);
    console.error("✗", msg);
  } else console.log("✓", msg);
};
const CELU = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true };
const COMPU = { viewport: { width: 1440, height: 900 } };

/**
 * Graba la página con el screencast de CDP y la codifica a WebM (VP8, 25 fps) con el ffmpeg que
 * trae Playwright. Equivale a `recordVideo`, que en esta máquina no anda porque el ffmpeg instalado
 * no es el de la versión de Playwright del proyecto.
 */
const FFMPEG = process.env.FFMPEG ?? ["/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux", "/opt/pw-browsers/ffmpeg-1013/ffmpeg-linux", "ffmpeg"].find((f) => f === "ffmpeg" || existsSync(f));
async function grabar(p, ancho, alto) {
  const cdp = await p.context().newCDPSession(p);
  const cuadros = [];
  cdp.on("Page.screencastFrame", (f) => {
    cuadros.push({ t: f.metadata.timestamp, jpg: Buffer.from(f.data, "base64") });
    cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 85, maxWidth: ancho, maxHeight: alto });
  return async (archivo) => {
    await cdp.send("Page.stopScreencast").catch(() => {});
    // A 25 fps fijos: en cada tick va el último cuadro recibido. El ffmpeg de Playwright no lee
    // de stdin (no trae el protocolo pipe), así que los JPEG van concatenados a un archivo.
    const fps = 25;
    const t0 = cuadros[0].t;
    const fin = cuadros[cuadros.length - 1].t + 0.5;
    const secuencia = [];
    let k = 0;
    for (let t = t0; t < fin; t += 1 / fps) {
      while (k + 1 < cuadros.length && cuadros[k + 1].t <= t) k++;
      secuencia.push(cuadros[k].jpg);
    }
    const tmp = `${archivo}.mjpeg`;
    writeFileSync(tmp, Buffer.concat(secuencia));
    const ff = spawn(FFMPEG, ["-loglevel", "error", "-y", "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", String(fps), "-i", `file:${tmp}`, "-vf", `scale=${ancho}:${alto}:force_original_aspect_ratio=decrease,pad=${ancho}:${alto}:(ow-iw)/2:(oh-ih)/2:color=0x070b12`, "-c:v", "libvpx", "-deadline", "realtime", "-cpu-used", "8", "-b:v", "2000k", "-auto-alt-ref", "0", "-threads", "4", "-r", String(fps), archivo]);
    let errorFf = "";
    ff.stderr.on("data", (d) => (errorFf += d));
    const codigo = await new Promise((r) => ff.on("close", r));
    unlinkSync(tmp);
    if (codigo !== 0) throw new Error(`ffmpeg salió con ${codigo}: ${errorFf}`);
    return { archivo, segundos: Math.round(fin - t0), cuadros: cuadros.length };
  };
}

// Sin señal, Next avisa en consola que pasa a navegación completa (la pantalla sale del precache):
// es el camino previsto, no un error.
function vigilar(p, errores) {
  p.on("pageerror", (e) => errores.push(String(e)));
  p.on("console", (m) => m.type() === "error" && !/vibrate|Failed to load resource|Falling back to browser navigation/.test(m.text()) && errores.push(m.text()));
}

/** Inicio → ¿cuántos? → ¿qué armamos? → sesión. Devuelve segundos y pantallas recorridas. */
async function armarSesion(p, sufijo, capturar) {
  await p.goto(`${base}/`, { waitUntil: "networkidle" });
  if (capturar) await p.screenshot({ path: `${salida}/inicio-${sufijo}.png` });
  const rutas = [];
  p.on("framenavigated", (f) => f === p.mainFrame() && rutas.push(new URL(f.url()).pathname));
  const t0 = Date.now();
  await p.getByRole("link", { name: /Arrancar entrenamiento/ }).click();
  await p.getByRole("heading", { name: "¿Cuántos vinieron hoy?" }).waitFor();
  for (let i = 0; i < 3; i++) await p.getByRole("button", { name: "Uno más" }).click();
  await p.waitForTimeout(500);
  if (capturar) await p.screenshot({ path: `${salida}/cuantos-vinieron-${sufijo}.png` });
  await p.getByRole("link", { name: "Seguir" }).click();
  await p.getByRole("heading", { name: "¿Qué armamos?" }).waitFor();
  if (capturar) await p.screenshot({ path: `${salida}/que-armamos-${sufijo}.png` });
  await p.getByRole("button", { name: "Armame la sesión" }).click();
  await p.getByRole("heading", { name: "Tu sesión" }).waitFor({ timeout: 15000 });
  const segundos = (Date.now() - t0) / 1000;
  await p.waitForTimeout(1300);
  if (capturar) await p.screenshot({ path: `${salida}/sesion-${sufijo}.png` });
  return { segundos, pantallas: [...new Set(rutas)] };
}

// SOLO=video corre solo la parte 3 (para iterar sobre el video).
const soloVideo = process.env.SOLO === "video";

// --- 1. Flujo completo a los dos tamaños -----------------------------------------------
for (const [sufijo, opciones] of soloVideo ? [] : [
  ["390", CELU],
  ["1440", COMPU],
]) {
  const ctx = await browser.newContext(opciones);
  const p = await ctx.newPage();
  const errores = [];
  vigilar(p, errores);
  const r = await armarSesion(p, sufijo, true);
  resultado.flujo[sufijo] = r;
  ok(r.segundos < 15, `${sufijo}: sesión armada en ${r.segundos.toFixed(1)} s (criterio 1: < 15 s)`);
  ok(r.pantallas.join(" → ") === "/armar → /armar/opciones → /sesion", `${sufijo}: 3 pantallas (${r.pantallas.join(" → ")})`);
  await p.getByRole("button", { name: "¡A la cancha!" }).click();
  await p.waitForURL(/\/cancha\?id=/);
  await p.getByRole("timer").waitFor();
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${salida}/modo-cancha-${sufijo}.png` });
  await p.goto(`${base}/biblioteca`, { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${salida}/biblioteca-${sufijo}.png` });
  if (sufijo === "1440") {
    await p.goto(`${base}/ficha?id=rondo-3-contra-1`, { waitUntil: "networkidle" });
    await p.getByRole("button", { name: "Duplicar y editar" }).click();
    await p.waitForURL(/\/editor\?id=/);
    await p.waitForSelector("[data-mov]");
    await p.locator('[data-mov="a1"]').click();
    await p.locator('[data-mov="a2"]').click({ modifiers: ["Shift"] });
    await p.locator("[data-trazo-editable]").first().locator("path").nth(1).click({ force: true }).catch(() => {});
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${salida}/editor-1440.png` });
  } else {
    await p.goto(`${base}/boceto`, { waitUntil: "networkidle" });
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${salida}/boceto-390.png` });
  }
  ok(errores.length === 0, `${sufijo}: sin errores en consola${errores.length ? ": " + errores.join(" | ") : ""}`);
  await ctx.close();
}

// --- 2. Offline (criterio 5) -------------------------------------------------------------
if (!soloVideo) {
  const ctx = await browser.newContext(CELU);
  const p = await ctx.newPage();
  const errores = [];
  vigilar(p, errores);
  await p.goto(`${base}/`, { waitUntil: "networkidle" });
  const sw = await p.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    for (let i = 0; i < 50 && !navigator.serviceWorker.controller; i++) await new Promise((r) => setTimeout(r, 100));
    // Espera a que termine el precache (la instalación ya pasó cuando está "activated").
    return { estado: reg.active?.state, controla: !!navigator.serviceWorker.controller };
  });
  await p.reload({ waitUntil: "networkidle" });
  ok(sw.estado === "activated", `service worker activo (${sw.estado})`);
  await ctx.setOffline(true);
  resultado.offline.sinRed = await p.evaluate(() => fetch("https://example.com", { mode: "no-cors" }).then(() => "hay red", () => "sin red"));
  ok(resultado.offline.sinRed === "sin red", "el navegador quedó sin red");
  const r = await armarSesion(p, "offline", false);
  ok(true, `offline: se genera la sesión (${r.segundos.toFixed(1)} s)`);
  await p.screenshot({ path: `${salida}/offline-sesion-390.png` });
  await p.getByRole("button", { name: "¡A la cancha!" }).click();
  await p.waitForURL(/\/cancha\?id=/);
  ok(await p.getByRole("timer").waitFor({ timeout: 8000 }).then(() => true, () => false), "offline: entra a modo cancha");
  await p.screenshot({ path: `${salida}/offline-cancha-390.png` });
  await p.goto(`${base}/biblioteca`);
  ok(await p.getByRole("heading", { name: "Biblioteca" }).waitFor({ timeout: 8000 }).then(() => true, () => false), "offline: abre la biblioteca");
  await p.goto(`${base}/ficha?id=rondo-3-contra-1`);
  ok(await p.getByRole("heading", { name: "Rondo 3 contra 1" }).waitFor({ timeout: 8000 }).then(() => true, () => false), "offline: abre una ficha");
  await p.goto(`${base}/boceto`);
  await p.waitForSelector('svg[aria-label="Pizarra editable"]', { timeout: 8000 });
  await p.getByPlaceholder("¿Cómo se llama?").fill("Boceto sin señal");
  await p.getByRole("list", { name: "Elementos para agregar" }).getByRole("button", { name: /^Equipo A/ }).click();
  await p.getByRole("button", { name: "Guardar", exact: true }).click();
  await p.waitForURL(/mis-ejercicios/);
  ok(await p.getByRole("link", { name: /Boceto sin señal/ }).waitFor({ timeout: 8000 }).then(() => true, () => false), "offline: guarda un boceto");
  await p.screenshot({ path: `${salida}/offline-boceto-390.png` });
  ok(errores.length === 0, `offline: sin errores en consola${errores.length ? ": " + errores.join(" | ") : ""}`);
  await ctx.close();
}

// --- 3. Video de los momentos firma ------------------------------------------------------
{
  const ctx = await browser.newContext(CELU);
  const p = await ctx.newPage();
  await p.goto(`${base}/`, { waitUntil: "networkidle" });
  const cortar = await grabar(p, 540, 1168);
  await p.goto(`${base}/armar`, { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  // 1. ¿Cuántos vinieron?: caen fichas, sale una, aparecen los arqueros.
  const mas = p.getByRole("button", { name: "Uno más" });
  for (let i = 0; i < 4; i++) {
    await mas.tap();
    await p.waitForTimeout(260);
  }
  await p.getByRole("button", { name: "Uno menos" }).tap();
  await p.waitForTimeout(450);
  await p.getByRole("radio", { name: "2 arqueros" }).check({ force: true });
  await p.waitForTimeout(900);
  await p.getByRole("link", { name: "Seguir" }).click();
  await p.getByRole("heading", { name: "¿Qué armamos?" }).waitFor();
  await p.waitForTimeout(700);
  // 2. Armame la sesión: FLIP de la división y cartas repartidas.
  await p.getByRole("button", { name: "Armame la sesión" }).tap();
  await p.getByRole("heading", { name: "Tu sesión" }).waitFor({ timeout: 15000 });
  await p.waitForTimeout(1800);
  // 3. Dame otro: un swipe corto que vuelve con resorte y uno que cambia la carta.
  const carta = p.locator("[data-carta] article").first();
  const c = await carta.boundingBox();
  const y = c.y + c.height * 0.45;
  for (const largo of [50, 200]) {
    await p.mouse.move(c.x + c.width / 2, y);
    await p.mouse.down();
    for (let i = 1; i <= 10; i++) await p.mouse.move(c.x + c.width / 2 + (largo * i) / 10, y, { steps: 2 });
    await p.mouse.up();
    await p.waitForTimeout(1400);
  }
  // 4. La pizarra que se mueve: ficha con el reproductor.
  await p.goto(`${base}/ficha?id=push-recepcion-orientada-triangulos`, { waitUntil: "networkidle" });
  await p.waitForTimeout(6500);
  // 5. El silbato visual: fin de bloque en modo cancha.
  await p.goto(`${base}/sesion`, { waitUntil: "networkidle" });
  await p.getByRole("button", { name: "¡A la cancha!" }).click();
  await p.waitForURL(/\/cancha\?id=/);
  const id = new URL(p.url()).searchParams.get("id");
  await p.evaluate((k) => localStorage.setItem(k, JSON.stringify({ indice: 0, finEn: Date.now() + 2500, restanteMs: 2500, completa: false })), `pb-cancha-${id}`);
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(4200);
  await p.getByRole("button", { name: /^Siguiente/ }).click();
  await p.waitForTimeout(1500);
  resultado.videos.push(await cortar(`${salida}/momentos-firma-390.webm`));
  await ctx.close();
}
{
  // 4 (editor): fichas con inercia en la compu.
  const ctx = await browser.newContext(COMPU);
  const p = await ctx.newPage();
  await p.goto(`${base}/editor`, { waitUntil: "networkidle" });
  const cortar = await grabar(p, 1280, 800);
  await p.waitForSelector('svg[aria-label="Pizarra editable"]');
  const paleta = (n) => p.getByRole("list", { name: "Elementos para agregar" }).getByRole("button", { name: new RegExp(`^${n}`) });
  for (const n of ["Equipo A", "Equipo A", "Equipo B", "Bocha"]) {
    await paleta(n).click();
    await p.waitForTimeout(250);
  }
  for (const [id, dx, dy] of [
    ["a1", -160, 60],
    ["a2", 180, -40],
    ["b1", -60, -120],
  ]) {
    const c = await p.locator(`[data-mov="${id}"]`).boundingBox();
    await p.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
    await p.mouse.down();
    for (let i = 1; i <= 8; i++) await p.mouse.move(c.x + c.width / 2 + (dx * i) / 8, c.y + c.height / 2 + (dy * i) / 8, { steps: 1 });
    await p.mouse.up();
    await p.waitForTimeout(1100);
  }
  await p.keyboard.press("p");
  const o = await p.locator('[data-mov="o1"]').boundingBox();
  const a2 = await p.locator('[data-mov="a2"]').boundingBox();
  await p.mouse.move(o.x + o.width / 2, o.y + o.height / 2);
  await p.mouse.down();
  await p.mouse.move(a2.x + a2.width / 2, a2.y + a2.height / 2, { steps: 15 });
  await p.mouse.up();
  await p.waitForTimeout(600);
  await p.getByRole("button", { name: "Ver animación" }).click();
  await p.waitForTimeout(4000);
  resultado.videos.push(await cortar(`${salida}/editor-inercia-1440.webm`));
  await ctx.close();
}

resultado.fallas = fallas;
if (!soloVideo) writeFileSync(`${salida}/resultado.json`, JSON.stringify(resultado, null, 2));
console.log(JSON.stringify(resultado, null, 2));
await browser.close();
process.exitCode = fallas.length ? 1 : 0;
