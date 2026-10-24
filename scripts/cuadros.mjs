// Saca cuadros de una animación en distintos momentos: node scripts/cuadros.mjs <ruta> <salida> [ms...]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const [ruta = "/dev/pizarra", salida = "capturas/cuadros", ...tiempos] = process.argv.slice(2);
const ms = tiempos.length ? tiempos.map(Number) : [200, 900, 1800, 3000, 4500];
mkdirSync(salida, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errores = [];
page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
page.on("pageerror", (e) => errores.push(String(e)));
await page.goto((process.env.BASE ?? "http://localhost:3000") + ruta, { waitUntil: "networkidle" });
const t0 = Date.now();
for (const t of ms) {
  const espera = t - (Date.now() - t0);
  if (espera > 0) await page.waitForTimeout(espera);
  await page.screenshot({ path: `${salida}/t${String(t).padStart(5, "0")}.png` });
}
console.log(errores.length ? "ERRORES:\n" + errores.join("\n") : "sin errores de consola");
await browser.close();
