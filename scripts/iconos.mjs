// Genera los PNG del manifest a partir de los SVG de public/iconos.
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium" });
const page = await browser.newPage();
const salidas = [
  ["icono.svg", 192, "icono-192.png"],
  ["icono.svg", 512, "icono-512.png"],
  ["icono.svg", 180, "apple-touch-icon.png"],
  ["icono-maskable.svg", 512, "icono-maskable-512.png"],
];
for (const [svg, tam, png] of salidas) {
  const contenido = readFileSync(`public/iconos/${svg}`, "utf8");
  await page.setViewportSize({ width: tam, height: tam });
  await page.setContent(`<style>*{margin:0}svg{display:block;width:${tam}px;height:${tam}px}</style>${contenido}`);
  await page.screenshot({ path: `public/iconos/${png}` });
  console.log(png);
}
await browser.close();
