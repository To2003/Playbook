// Boceto del celu (390 × 844, táctil) y "Duplicar y editar" desde un ejercicio base: node e2e/boceto.mjs [base]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
mkdirSync("capturas/m7", { recursive: true });
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
const errores = [];
p.on("pageerror", (e) => errores.push(String(e)));
p.on("console", (m) => m.type() === "error" && !m.text().includes("vibrate") && errores.push(m.text()));
const ok = (cond, msg) => {
  if (!cond) {
    console.error("✗", msg);
    process.exitCode = 1;
  } else console.log("✓", msg);
};
const centro = async (sel) => {
  const c = await p.locator(sel).first().boundingBox();
  return { x: c.x + c.width / 2, y: c.y + c.height / 2 };
};
const arrastrar = async (desde, hasta) => {
  await p.mouse.move(desde.x, desde.y);
  await p.mouse.down();
  await p.mouse.move(hasta.x, hasta.y, { steps: 10 });
  await p.waitForTimeout(120);
  await p.mouse.up();
};

// 1. Duplicar y editar un base → abre el boceto con la copia.
await p.goto(`${base}/ficha?id=push-recepcion-orientada-triangulos`, { waitUntil: "networkidle" });
await p.getByRole("button", { name: "Duplicar y editar" }).click();
await p.waitForURL(/boceto\?id=p-/);
await p.waitForSelector("[data-mov]");
ok((await p.getByPlaceholder("¿Cómo se llama?").inputValue()).endsWith("(copia)"), "duplicar y editar abre el boceto con la copia");
ok((await p.locator("[data-mov]").count()) > 3, "la copia trae las fichas del base");
await p.getByRole("link", { name: "Volver a mis ejercicios" }).click();
await p.waitForURL(/mis-ejercicios/);
ok(await p.getByRole("link", { name: /\(copia\)/ }).waitFor().then(() => true, () => false), "la copia aparece en Mis ejercicios (lista, como su base)");

// 2. Boceto nuevo: fichas, arrastre y una flecha de pase.
await p.getByRole("link", { name: "Hacer un boceto" }).click();
await p.waitForURL(/boceto/);
await p.waitForSelector('svg[aria-label="Pizarra editable"]');
await p.getByPlaceholder("¿Cómo se llama?").fill("Salida por la izquierda");
await p.getByRole("combobox", { name: "Fase" }).selectOption("aplicado");
const paleta = (n) => p.getByRole("list", { name: "Elementos para agregar" }).getByRole("button", { name: new RegExp(`^${n}`) });
await paleta("Equipo A").click();
await paleta("Equipo A").click();
await paleta("Bocha").click();
await paleta("Equipo B").click();
ok((await p.locator("[data-mov]").count()) === 4, "la paleta compacta agrega fichas");
const a2 = await centro('[data-mov="a2"]');
await arrastrar(a2, { x: a2.x + 90, y: a2.y - 140 });
await p.waitForTimeout(900);
const a2b = await centro('[data-mov="a2"]');
ok(Math.hypot(a2b.x - a2.x, a2b.y - a2.y) > 60, "se arrastra una ficha en la vista parada");
// La bocha quedó cerca de a1: pase de a1 a a2.
const a1 = await centro('[data-mov="a1"]');
const o1 = await centro('[data-mov="o1"]');
await arrastrar(o1, a1);
await p.waitForTimeout(500);
await p.getByRole("radio", { name: "Pase" }).click();
await arrastrar(await centro('[data-mov="o1"]'), a2b);
ok((await p.locator("[data-trazo-editable]").count()) === 1, "la flecha de pase queda dibujada");
await p.screenshot({ path: "capturas/m7/boceto-390.png" });
await p.getByRole("button", { name: "Guardar", exact: true }).click();
await p.waitForURL(/mis-ejercicios/);
ok(await p.getByRole("link", { name: /Salida por la izquierda/ }).waitFor().then(() => true, () => false), "el boceto aparece en Mis ejercicios");
ok((await p.getByRole("heading", { name: /Borradores/ }).textContent()).includes("1"), "el boceto queda como borrador");
await p.screenshot({ path: "capturas/m7/mis-ejercicios-390.png" });

// 3. En el celu, /editor ofrece el boceto.
await p.goto(`${base}/editor`, { waitUntil: "networkidle" });
ok(await p.getByRole("heading", { name: "El editor completo es para la compu" }).isVisible(), "en el celu el editor deriva al boceto");

ok(errores.length === 0, `sin errores en consola${errores.length ? ": " + errores.join(" | ") : ""}`);
await b.close();
