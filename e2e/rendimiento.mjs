// Cuadros por segundo con la CPU frenada 4× (regla de movimiento: 60 fps en un Android de gama media).
// Mide con requestAnimationFrame durante cada animación: promedio y cuadros largos (> 50 ms).
// Uso: node e2e/rendimiento.mjs [base]   (mejor contra el build de producción)
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const resultado = {};

async function pagina(opciones) {
  const ctx = await b.newContext(opciones);
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  return { ctx, p };
}
const empezar = (p) =>
  p.evaluate(() => {
    window.__cuadros = [];
    let previo = performance.now();
    const tick = (t) => {
      window.__cuadros.push(t - previo);
      previo = t;
      window.__raf = requestAnimationFrame(tick);
    };
    window.__raf = requestAnimationFrame(tick);
  });
const terminar = (p) =>
  p.evaluate(() => {
    cancelAnimationFrame(window.__raf);
    const c = window.__cuadros.slice(1);
    const total = c.reduce((s, x) => s + x, 0);
    return { fps: Math.round((c.length / total) * 1000), cuadrosLargos: c.filter((x) => x > 50).length, peorMs: Math.round(Math.max(...c)), cuadros: c.length };
  });

const CELU = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true };

// Momento 1 y 2: contador, FLIP de la división y cartas repartidas.
{
  const { ctx, p } = await pagina(CELU);
  await p.goto(`${base}/armar`, { waitUntil: "networkidle" });
  await empezar(p);
  for (let i = 0; i < 6; i++) {
    await p.getByRole("button", { name: "Uno más" }).tap();
    await p.waitForTimeout(150);
  }
  await p.waitForTimeout(600);
  resultado.contador = await terminar(p);
  await p.getByRole("link", { name: "Seguir" }).click();
  await p.getByRole("heading", { name: "¿Qué armamos?" }).waitFor();
  await p.getByRole("button", { name: "Armame la sesión" }).tap();
  await empezar(p);
  await p.getByRole("heading", { name: "Tu sesión" }).waitFor({ timeout: 20000 });
  await p.waitForTimeout(1200);
  resultado.divisionYCartas = await terminar(p);
  // Momento 3: swipe de "Dame otro".
  const carta = p.locator("[data-carta] article").first();
  const c = await carta.boundingBox();
  const y = c.y + c.height * 0.45;
  await empezar(p);
  await p.mouse.move(c.x + c.width / 2, y);
  await p.mouse.down();
  for (let i = 1; i <= 12; i++) await p.mouse.move(c.x + c.width / 2 + i * 18, y, { steps: 2 });
  await p.mouse.up();
  await p.waitForTimeout(1200);
  resultado.dameOtro = await terminar(p);
  await ctx.close();
}
// Momento 4: la pizarra en la ficha (cancha con textura, varios jugadores).
{
  const { ctx, p } = await pagina(CELU);
  await p.goto(`${base}/ficha?id=push-recepcion-orientada-triangulos`, { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  await empezar(p);
  await p.waitForTimeout(5000);
  resultado.pizarra = await terminar(p);
  await ctx.close();
}
// Editor: arrastre con inercia.
{
  const { ctx, p } = await pagina({ viewport: { width: 1440, height: 900 } });
  await p.goto(`${base}/editor`, { waitUntil: "networkidle" });
  await p.waitForSelector('svg[aria-label="Pizarra editable"]');
  for (let i = 0; i < 6; i++) await p.getByRole("list", { name: "Elementos para agregar" }).getByRole("button", { name: /^Equipo A/ }).click();
  const f = await p.locator('[data-mov="a1"]').boundingBox();
  await empezar(p);
  await p.mouse.move(f.x + f.width / 2, f.y + f.height / 2);
  await p.mouse.down();
  for (let i = 1; i <= 15; i++) await p.mouse.move(f.x + f.width / 2 - i * 14, f.y + f.height / 2 + i * 5, { steps: 1 });
  await p.mouse.up();
  await p.waitForTimeout(1200);
  resultado.editorArrastre = await terminar(p);
  await ctx.close();
}

writeFileSync("capturas/final/rendimiento-cpu4x.json", JSON.stringify(resultado, null, 2));
console.log(JSON.stringify(resultado, null, 2));
await b.close();
