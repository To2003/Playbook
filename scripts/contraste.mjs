// Pruebas de contraste de fichas: escala de grises y brillo alto (sol).
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const salida = "capturas/contraste";
mkdirSync(salida, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 390, height: 1200 }, deviceScaleFactor: 2 });
await page.goto((process.env.BASE ?? "http://localhost:3000") + "/dev/fichas", { waitUntil: "networkidle" });
for (const [nombre, filtro] of [["normal", "none"], ["grises", "grayscale(1)"], ["brillo", "brightness(1.6)"]]) {
  await page.evaluate((f) => (document.documentElement.style.filter = f), filtro);
  await page.screenshot({ path: `${salida}/fichas-${nombre}.png`, fullPage: true });
  console.log(nombre);
}
await browser.close();
