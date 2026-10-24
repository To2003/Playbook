// Modo cancha: retrato, fin de bloque (silbato visual), modo sol que persiste, hidratación y horizontal.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.env.BASE ?? "http://localhost:3000";
const salida = process.env.OUT ?? "capturas/m5";
mkdirSync(salida, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errores = [];
page.on("pageerror", (e) => errores.push(String(e)));
page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
const resultado = {};

// Armar una sesión de 11 + 2.
await page.goto(base + "/armar", { waitUntil: "networkidle" });
const menos = page.getByRole("button", { name: "Uno menos" });
for (let i = 0; i < 3; i++) await menos.tap();
await page.getByRole("radio", { name: "2 arqueros" }).check({ force: true });
await page.getByRole("link", { name: "Seguir" }).click();
await page.getByRole("button", { name: "Armame la sesión" }).tap();
await page.getByRole("heading", { name: "Tu sesión" }).waitFor({ timeout: 10000 });
await page.getByRole("button", { name: "¡A la cancha!" }).click();
await page.waitForURL(/\/cancha\?id=/);
const id = new URL(page.url()).searchParams.get("id");
await page.getByRole("timer").waitFor();
await page.waitForTimeout(1200);
await page.screenshot({ path: `${salida}/cancha-390.png` });
resultado.wakeLockDisponible = await page.evaluate(() => "wakeLock" in navigator);

// Fin de bloque: se fuerza que falten 1,5 s.
await page.evaluate((k) => localStorage.setItem(k, JSON.stringify({ indice: 0, finEn: Date.now() + 1500, restanteMs: 1500, completa: false })), `pb-cancha-${id}`);
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1550);
await page.screenshot({ path: `${salida}/silbato-destello.png` });
await page.waitForTimeout(900);
resultado.tiempo = await page.getByRole("alert").first().innerText();
await page.screenshot({ path: `${salida}/silbato-tiempo.png` });

// Siguiente: el bloque 2 y después la hidratación.
await page.getByRole("button", { name: /^Siguiente/ }).click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: /^Siguiente/ }).click();
await page.waitForTimeout(400);
resultado.hidratacion = await page.getByText("Hidratación: dos minutos").first().isVisible();
await page.screenshot({ path: `${salida}/hidratacion-390.png` });

// Modo sol: se guarda en IndexedDB y sobrevive a recargar.
await page.getByRole("button", { name: "Modo sol" }).click();
await page.waitForTimeout(300);
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(600);
resultado.solPersistido = await page.locator('[data-mode="cancha"]').first().getAttribute("data-sol");
await page.getByRole("button", { name: /^Siguiente/ }).click();
await page.waitForTimeout(1200);
await page.screenshot({ path: `${salida}/sol-390.png` });

// Horizontal.
await page.setViewportSize({ width: 844, height: 390 });
await page.waitForTimeout(800);
await page.screenshot({ path: `${salida}/horizontal-sol.png` });
await page.getByRole("button", { name: "Modo noche" }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${salida}/horizontal.png` });

console.log(JSON.stringify({ ...resultado, errores }, null, 2));
await browser.close();
