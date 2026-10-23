// Capturas de pantalla para revisar el diseño: node scripts/capturas.mjs [ancho] [ruta...]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const ancho = Number(process.argv[2] ?? 390);
const rutas = process.argv.slice(3).length ? process.argv.slice(3) : ["/", "/armar", "/sesion", "/cancha"];
const base = process.env.BASE ?? "http://localhost:3000";
const salida = process.env.OUT ?? "capturas";
mkdirSync(salida, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: ancho, height: ancho < 600 ? 844 : 900 }, deviceScaleFactor: 2, hasTouch: ancho < 600, isMobile: ancho < 600 });
for (const ruta of rutas) {
  await page.goto(base + ruta, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const nombre = (ruta === "/" ? "inicio" : ruta.slice(1).replaceAll("/", "-")) + `-${ancho}`;
  await page.screenshot({ path: `${salida}/${nombre}.png` });
  // En la captura completa, la barra fija va al pie del documento y no flota a mitad de página.
  const estilo = await page.addStyleTag({ content: "body{position:relative} .fixed{position:absolute !important}" });
  await page.screenshot({ path: `${salida}/${nombre}-completa.png`, fullPage: true });
  await estilo.evaluate((n) => n.remove());
  console.log(nombre);
}
await browser.close();
