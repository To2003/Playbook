// Graba las tomas reales de la app para el trailer (390 × 844, deviceScaleFactor 3).
// Requiere la app en modo producción:  (en la raíz) npm run build && npm start -- -p 3100
// Uso:  node grabar.mjs [base]   →  public/tomas/{armado,pizarra,cancha}.mp4 + public/tomas/marcas.json
//
// Cada toma se graba con el screencast de CDP (Page.startScreencast), se remuestrea a 30 fps
// fijos y se codifica a H.264 con el ffmpeg que trae Remotion. Los toques se ven como un círculo
// semitransparente donde "apoya el dedo".
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const base = process.argv[2] ?? "http://localhost:3100";
const salida = "public/tomas";
mkdirSync(salida, { recursive: true });
const FPS = 30;
const ANCHO = 390;
const ALTO = 844;
const DPR = 3;
const require = createRequire(import.meta.url);
const dirFfmpeg = dirname(require.resolve("@remotion/compositor-linux-x64-gnu/package.json"));
const FFMPEG = join(dirFfmpeg, "ffmpeg");

// Sin forzar la escala, el screencast entrega los cuadros en píxeles CSS (390 × 844) aunque el contexto sea 3×.
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium", args: [`--force-device-scale-factor=${DPR}`] });
const ctx = await browser.newContext({ viewport: { width: ANCHO, height: ALTO }, deviceScaleFactor: DPR, isMobile: true, hasTouch: false });

// El "dedo": un círculo que sigue al puntero y se achica al apoyar. Sobrevive a las navegaciones.
await ctx.addInitScript(() => {
  const poner = () => {
    if (document.getElementById("dedo-trailer")) return;
    const d = document.createElement("div");
    d.id = "dedo-trailer";
    d.style.cssText =
      "position:fixed;left:0;top:0;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(255,255,255,.28);border:2px solid rgba(255,255,255,.75);box-shadow:0 0 0 1px rgba(0,0,0,.25);pointer-events:none;z-index:2147483647;opacity:0;transition:opacity 160ms ease-out,transform 110ms ease-out;";
    document.documentElement.append(d);
    const ultima = JSON.parse(sessionStorage.getItem("dedo-trailer") ?? "null");
    if (ultima) {
      d.style.left = `${ultima.x}px`;
      d.style.top = `${ultima.y}px`;
    }
    // Quieto, el dedo se va solo: así no queda "apoyado" sobre un botón que nadie toca.
    let apagar;
    const mostrar = () => {
      clearTimeout(apagar);
      d.style.opacity = "1";
      apagar = setTimeout(() => (d.style.opacity = "0"), 650);
    };
    addEventListener("pointermove", (e) => {
      mostrar();
      d.style.left = `${e.clientX}px`;
      d.style.top = `${e.clientY}px`;
      sessionStorage.setItem("dedo-trailer", JSON.stringify({ x: e.clientX, y: e.clientY }));
    }, { capture: true, passive: true });
    addEventListener("pointerdown", () => {
      mostrar();
      clearTimeout(apagar);
      d.style.transform = "scale(.8)";
      d.style.background = "rgba(255,255,255,.45)";
    }, { capture: true, passive: true });
    addEventListener("pointerup", () => {
      mostrar();
      d.style.transform = "scale(1)";
      d.style.background = "rgba(255,255,255,.28)";
    }, { capture: true, passive: true });
  };
  if (document.documentElement) poner();
  addEventListener("DOMContentLoaded", poner);
});

const p = await ctx.newPage();
const errores = [];
p.on("pageerror", (e) => errores.push(String(e)));

/** Graba hasta que se llame a la función devuelta. Las marcas quedan en segundos desde el primer cuadro. */
async function grabar(nombre) {
  const cdp = await ctx.newCDPSession(p);
  const cuadros = [];
  const marcas = {};
  cdp.on("Page.screencastFrame", (f) => {
    cuadros.push({ t: f.metadata.timestamp, jpg: Buffer.from(f.data, "base64") });
    cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: ANCHO * DPR, maxHeight: ALTO * DPR, everyNthFrame: 1 });
  const marcar = (clave, extra) => (marcas[clave] = { t: Date.now() / 1000, ...extra });
  const cortar = async () => {
    await cdp.send("Page.stopScreencast").catch(() => {});
    await cdp.detach().catch(() => {});
    const t0 = cuadros[0].t;
    const fin = cuadros[cuadros.length - 1].t;
    const secuencia = [];
    let k = 0;
    for (let t = t0; t <= fin; t += 1 / FPS) {
      while (k + 1 < cuadros.length && cuadros[k + 1].t <= t) k++;
      secuencia.push(cuadros[k].jpg);
    }
    const tmp = join(salida, `${nombre}.mjpeg`);
    writeFileSync(tmp, Buffer.concat(secuencia));
    const archivo = join(salida, `${nombre}.mp4`);
    const ff = spawn(FFMPEG, ["-loglevel", "error", "-y", "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", String(FPS), "-i", tmp, "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-r", String(FPS), "-movflags", "+faststart", archivo], {
      env: { ...process.env, LD_LIBRARY_PATH: dirFfmpeg },
    });
    let err = "";
    ff.stderr.on("data", (d) => (err += d));
    const codigo = await new Promise((r) => ff.on("close", r));
    unlinkSync(tmp);
    if (codigo !== 0) throw new Error(`ffmpeg (${nombre}): ${err}`);
    const relativas = Object.fromEntries(Object.entries(marcas).map(([k2, v]) => [k2, { ...v, t: Math.round((v.t - t0) * 100) / 100 }]));
    const duracion = Math.round((fin - t0) * 100) / 100;
    const j = cuadros[0].jpg;
    let tam = "?";
    for (let i = 2; i < j.length; ) {
      if (j[i] === 0xff && (j[i + 1] === 0xc0 || j[i + 1] === 0xc2)) {
        tam = `${j.readUInt16BE(i + 7)}×${j.readUInt16BE(i + 5)}`;
        break;
      }
      i += 2 + j.readUInt16BE(i + 2);
    }
    console.log(`${nombre}: ${duracion} s, ${cuadros.length} cuadros reales de ${tam} (${Math.round(cuadros.length / duracion)} por segundo) → ${archivo}`);
    return { archivo, duracion, cuadrosReales: cuadros.length, marcas: relativas };
  };
  return { marcar, cortar };
}

// --- Movimientos del "dedo" ----------------------------------------------------------
let pos = { x: ANCHO / 2, y: ALTO * 0.75 };
const esperar = (ms) => p.waitForTimeout(ms);
async function ir(x, y, ms = 380) {
  const pasos = Math.max(6, Math.round(ms / 16));
  const desde = { ...pos };
  for (let i = 1; i <= pasos; i++) {
    const k = i / pasos;
    const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2; // ease-in-out, como una mano
    await p.mouse.move(desde.x + (x - desde.x) * e, desde.y + (y - desde.y) * e);
    await esperar(ms / pasos);
  }
  pos = { x, y };
}
async function centroDe(loc) {
  const c = await loc.boundingBox();
  return { x: c.x + c.width / 2, y: c.y + c.height / 2 };
}
async function tocar(loc, { viaje = 380, apoyo = 90 } = {}) {
  const c = await centroDe(loc);
  await ir(c.x, c.y, viaje);
  await p.mouse.down();
  await esperar(apoyo);
  await p.mouse.up();
}

const marcasTodas = {};

// --- Toma 1: ¿cuántos vinieron? → ¿qué armamos? → división → cartas → "Dame otro" ----------
await p.goto(`${base}/armar?demo=1`, { waitUntil: "networkidle" });
await p.mouse.move(pos.x, pos.y);
await esperar(900);
{
  const { marcar, cortar } = await grabar("armado");
  await esperar(600);
  marcar("cuantos");
  const mas = p.getByRole("button", { name: "Uno más" });
  for (let i = 0; i < 4; i++) {
    await tocar(mas, { viaje: i ? 160 : 420 });
    await esperar(260);
  }
  await esperar(250);
  await tocar(p.locator('label:has(input[name="arqueros"][value="1"])'), { viaje: 420 });
  marcar("arquero");
  await esperar(1100);
  await tocar(p.getByRole("link", { name: "Seguir" }), { viaje: 420 });
  await p.getByRole("heading", { name: "¿Qué armamos?" }).waitFor();
  marcar("queArmamos");
  await esperar(500);
  await tocar(p.locator('label:has(input[name="nivel"][value="intermedio"])'), { viaje: 450 });
  await esperar(350);
  await tocar(p.locator('label:has(input[name="intensidad"][value="2"])'), { viaje: 380 });
  await esperar(450);
  marcar("toqueArmame");
  await tocar(p.getByRole("button", { name: "Armame la sesión" }), { viaje: 450 });
  await p.getByRole("heading", { name: "Tu sesión" }).waitFor({ timeout: 15000 });
  marcar("tuSesion");
  await esperar(1700);
  // "Dame otro": swipe lateral sobre la primera carta.
  const carta = p.locator("[data-carta] article").first();
  const c = await carta.boundingBox();
  const y = c.y + c.height * 0.42;
  await ir(c.x + c.width * 0.3, y, 450);
  marcar("swipe");
  await p.mouse.down();
  for (let i = 1; i <= 14; i++) {
    await p.mouse.move(c.x + c.width * 0.3 + i * 17, y);
    pos = { x: c.x + c.width * 0.3 + i * 17, y };
    await esperar(16);
  }
  await p.mouse.up();
  await esperar(1500);
  marcar("finSwipe");
  marcasTodas.armado = await cortar();
}
const idSesion = await p.evaluate(async () => {
  const r = await new Promise((ok) => {
    const req = indexedDB.open("playbook");
    req.onsuccess = () => {
      const st = req.result.transaction("sesiones").objectStore("sesiones").getAll();
      st.onsuccess = () => ok(st.result);
    };
  });
  return r.sort((a, b) => b.fecha - a.fecha)[0].id;
});

// --- Toma 2: la pizarra con la bocha viajando por el pase ----------------------------------
await p.goto(`${base}/ficha?id=rondo-3-contra-1`, { waitUntil: "networkidle" });
await ir(ANCHO * 0.88, ALTO * 0.96, 200);
await p.evaluate(() => {
  const d = document.getElementById("dedo-trailer");
  if (d) d.style.opacity = "0";
});
await esperar(300);
{
  const { marcar, cortar } = await grabar("pizarra");
  const caja = await p.locator('[aria-label^="Pizarra"]').first().boundingBox();
  marcar("caja", { caja });
  await esperar(7500);
  marcasTodas.pizarra = await cortar();
}

// --- Toma 3: modo cancha, el cronómetro baja y llega el destello ---------------------------
await p.goto(`${base}/sesion`, { waitUntil: "networkidle" });
await p.evaluate((k) => localStorage.setItem(k, JSON.stringify({ indice: 0, finEn: Date.now() + 6000, restanteMs: 6000, completa: false })), `pb-cancha-${idSesion}`);
await p.goto(`${base}/cancha?id=${idSesion}`, { waitUntil: "networkidle" });
await p.evaluate(() => {
  const d = document.getElementById("dedo-trailer");
  if (d) d.style.opacity = "0";
});
{
  const { marcar, cortar } = await grabar("cancha");
  marcar("inicio");
  await p.getByText("¡Tiempo!").first().waitFor({ timeout: 15000 });
  marcar("tiempo");
  await esperar(1600);
  marcasTodas.cancha = await cortar();
}

writeFileSync(join(salida, "marcas.json"), JSON.stringify(marcasTodas, null, 2));
console.log(JSON.stringify(Object.fromEntries(Object.entries(marcasTodas).map(([k, v]) => [k, { duracion: v.duracion, marcas: v.marcas }])), null, 2));
if (errores.length) console.log("errores:", errores);
await browser.close();
