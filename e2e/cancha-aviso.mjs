// Criterio 11 sin recargar: la pantalla queda prendida (Wake Lock) y el fin de bloque avisa con
// vibración y destello. Se espían las APIs y se adelanta el reloj con page.clock.
// Uso: node e2e/cancha-aviso.mjs [base]
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await ctx.addInitScript(() => {
  window.__llamadas = { vibrar: [], wakeLock: 0, liberado: 0 };
  navigator.vibrate = (p) => (window.__llamadas.vibrar.push(p), true);
  const sentinela = () => ({ released: false, release: async () => void window.__llamadas.liberado++, addEventListener() {}, removeEventListener() {} });
  Object.defineProperty(navigator, "wakeLock", { value: { request: async () => (window.__llamadas.wakeLock++, sentinela()) }, configurable: true });
});
const p = await ctx.newPage();
const errores = [];
p.on("pageerror", (e) => errores.push(String(e)));
const ok = (cond, msg) => {
  if (!cond) {
    console.error("✗", msg);
    process.exitCode = 1;
  } else console.log("✓", msg);
};

await p.goto(`${base}/armar`, { waitUntil: "networkidle" });
await p.getByRole("link", { name: "Seguir" }).click();
await p.getByRole("button", { name: "Armame la sesión" }).tap();
await p.getByRole("heading", { name: "Tu sesión" }).waitFor({ timeout: 10000 });
await p.getByRole("button", { name: "¡A la cancha!" }).tap();
await p.waitForURL(/\/cancha\?id=/);
await p.getByRole("timer").waitFor();
await p.waitForTimeout(500);
// Reloj falso recién ahora: el cronómetro mide contra Date.now, así que adelantarlo es "pasó el tiempo".
await p.clock.install();
const l0 = await p.evaluate(() => window.__llamadas);
ok(l0.wakeLock >= 1, `al entrar pide Wake Lock (${l0.wakeLock})`);
const minutos = Number((await p.getByRole("timer").innerText()).split(":")[0]);
await p.clock.fastForward((minutos + 1) * 60 * 1000);
await p.clock.runFor(2000);
await p.waitForTimeout(500);
const l1 = await p.evaluate(() => window.__llamadas);
ok(l1.vibrar.length >= 1, `al terminar el bloque vibra (${JSON.stringify(l1.vibrar)})`);
ok(await p.getByText("¡Tiempo!").first().isVisible(), "y muestra “¡Tiempo!” con el botón Siguiente");
await p.screenshot({ path: "capturas/final/fin-de-bloque-390.png" });
ok(errores.length === 0, `sin errores${errores.length ? ": " + errores.join(" | ") : ""}`);
await b.close();
