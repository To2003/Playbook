// Flujo completo en el celu: inicio → ¿cuántos? → ¿qué armamos? → sesión. Mide el criterio 1 y saca cuadros.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.env.BASE ?? "http://localhost:3000";
const salida = process.env.OUT ?? "capturas/m4";
mkdirSync(salida, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errores = [];
page.on("pageerror", (e) => errores.push(String(e)));
page.on("console", (m) => m.type() === "error" && errores.push(m.text()));

await page.goto(base + "/", { waitUntil: "networkidle" });
const t0 = Date.now();
await page.getByRole("link", { name: /Arrancar entrenamiento/ }).click();
await page.getByRole("heading", { name: "¿Cuántos vinieron hoy?" }).waitFor();
// Momento 1: tres toques de + con cuadros en el medio.
const mas = page.getByRole("button", { name: "Uno más" });
await mas.tap();
await page.waitForTimeout(110);
await page.screenshot({ path: `${salida}/1-contador-cae.png` });
await mas.tap();
await mas.tap();
await page.waitForTimeout(600);
await page.screenshot({ path: `${salida}/1-contador.png` });
await page.getByRole("link", { name: "Seguir" }).click();
await page.getByRole("heading", { name: "¿Qué armamos?" }).waitFor();
await page.screenshot({ path: `${salida}/2-que-armamos.png` });
await page.getByRole("button", { name: "Armame la sesión" }).tap();
// Momento 2: la división con Flip.
await page.waitForTimeout(480);
await page.screenshot({ path: `${salida}/3-division-flip.png` });
await page.waitForTimeout(650);
await page.screenshot({ path: `${salida}/3-division.png` });
await page.getByRole("heading", { name: "Tu sesión" }).waitFor({ timeout: 10000 });
const segundos = (Date.now() - t0) / 1000;
await page.waitForTimeout(150);
await page.screenshot({ path: `${salida}/4-sesion-reparte.png` });
await page.waitForTimeout(900);
await page.screenshot({ path: `${salida}/4-sesion.png` });

// Momento 3: swipe sobre la primera tarjeta.
const carta = page.locator("[data-carta] article").first();
const nombreAntes = await carta.locator("h2").innerText();
const caja = await carta.boundingBox();
const y = caja.y + caja.height * 0.45;
await page.mouse.move(caja.x + caja.width * 0.5, y);
await page.mouse.down();
for (let i = 1; i <= 8; i++) await page.mouse.move(caja.x + caja.width * 0.5 + i * 22, y, { steps: 2 });
await page.screenshot({ path: `${salida}/5-swipe.png` });
await page.mouse.up();
await page.waitForTimeout(250);
await page.screenshot({ path: `${salida}/5-swipe-entra.png` });
await page.waitForTimeout(700);
const nombreDespues = await carta.locator("h2").innerText();
await page.screenshot({ path: `${salida}/5-dame-otro.png` });

console.log(JSON.stringify({ segundosHastaSesion: segundos, dameOtro: { antes: nombreAntes, despues: nombreDespues, cambio: nombreAntes !== nombreDespues }, errores }, null, 2));
await browser.close();
