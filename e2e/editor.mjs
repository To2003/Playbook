// Prueba del editor de compu (1440 × 900): node e2e/editor.mjs [base]
// Agrega fichas, arrastra con inercia, selecciona varias, duplica, alinea, deshace y rehace,
// dibuja un trazo, recorre los pasos y guarda. Deja capturas en capturas/m7.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
mkdirSync("capturas/m7", { recursive: true });
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errores = [];
p.on("pageerror", (e) => errores.push(String(e)));
p.on("console", (m) => m.type() === "error" && errores.push(m.text()));
const ok = (cond, msg) => {
  if (!cond) {
    console.error("✗", msg);
    process.exitCode = 1;
  } else console.log("✓", msg);
};

await p.goto(`${base}/editor`, { waitUntil: "networkidle" });
await p.waitForSelector('svg[aria-label="Pizarra editable"]');
const ficha = (id) => p.locator(`svg[aria-label="Pizarra editable"] [data-mov="${id}"]`);
const caja = async (id) => (await ficha(id).boundingBox());
const centro = async (id) => {
  const c = await caja(id);
  return { x: c.x + c.width / 2, y: c.y + c.height / 2 };
};
const paleta = (n) => p.getByRole("list", { name: "Elementos para agregar" }).getByRole("button", { name: new RegExp(`^${n}`) });

for (const n of ["Equipo A", "Equipo A", "Equipo B", "Bocha"]) await paleta(n).click();
ok((await p.locator("[data-mov]").count()) === 4, "la paleta agrega 4 elementos");

// Arrastrar con inercia: soltar con velocidad y ver que sigue un poco.
const a1 = await centro("a1");
await p.mouse.move(a1.x, a1.y);
await p.mouse.down();
for (let i = 1; i <= 8; i++) await p.mouse.move(a1.x - i * 18, a1.y + i * 6, { steps: 1 });
await p.mouse.up();
const alSoltar = await centro("a1");
await p.waitForTimeout(900);
const quieto = await centro("a1");
ok(Math.hypot(quieto.x - alSoltar.x, quieto.y - alSoltar.y) > 4, `la inercia sigue moviendo la ficha después de soltar (${Math.round(Math.hypot(quieto.x - alSoltar.x, quieto.y - alSoltar.y))} px)`);
ok(await p.getByText("Sin guardar").isVisible(), "el arrastre quedó como cambio");

// Selección múltiple con shift y movimiento en bloque.
await ficha("a1").click();
await ficha("a2").click({ modifiers: ["Shift"] });
await ficha("b1").click({ modifiers: ["Shift"] });
ok((await p.getByText("Selección (3)").count()) === 1, "shift-click selecciona tres");
// Pausa humana: si el arrastre arranca a los pocos ms del shift-click sobre la misma ficha,
// Draggable a veces no lo toma (ver DECISIONES.md).
await p.waitForTimeout(250);
const antesA2 = await centro("a2");
const desde = await centro("b1");
await p.mouse.move(desde.x, desde.y);
await p.mouse.down();
await p.mouse.move(desde.x + 60, desde.y + 40, { steps: 12 });
await p.waitForTimeout(150);
await p.mouse.up();
await p.waitForTimeout(1200);
const despuesA2 = await centro("a2");
ok(despuesA2.x - antesA2.x > 30 && despuesA2.y - antesA2.y > 20, `la selección se mueve en bloque (a2 ${Math.round(despuesA2.x - antesA2.x)}, ${Math.round(despuesA2.y - antesA2.y)} px)`);

// Alinear en fila y duplicar con Ctrl+D.
await p.getByRole("button", { name: "Alinear en fila" }).click();
await p.waitForTimeout(100);
const ys = await Promise.all(["a1", "a2", "b1"].map(async (x) => Math.round((await centro(x)).y)));
ok(Math.max(...ys) - Math.min(...ys) <= 2, `alinear en fila deja la misma altura (${ys.join(", ")})`);
await p.keyboard.press("Control+d");
ok((await p.locator("[data-mov]").count()) === 7, "Ctrl+D duplica la selección");
await p.keyboard.press("Control+z");
ok((await p.locator("[data-mov]").count()) === 4, "Ctrl+Z deshace el duplicado");
await p.keyboard.press("Control+Shift+z");
ok((await p.locator("[data-mov]").count()) === 7, "Ctrl+Shift+Z lo rehace");
await p.keyboard.press("Control+z");
await p.keyboard.press("Escape");

// Flechas: corren la ficha elegida medio metro.
await ficha("o1").click();
const o1 = await centro("o1");
await p.keyboard.press("Shift+ArrowRight");
await p.waitForTimeout(50);
ok((await centro("o1")).x > o1.x + 3, "Shift+→ corre la bocha");
await p.keyboard.press("Escape");

// Trazo: herramienta Desplazamiento (D) y arrastre desde a1.
await p.keyboard.press("d");
const t0 = await centro("a1");
await p.mouse.move(t0.x, t0.y);
await p.mouse.down();
await p.mouse.move(t0.x + 120, t0.y - 90, { steps: 10 });
await p.mouse.up();
ok((await p.getByRole("button", { name: /^2/ }).count()) >= 1, "el trazo en el último paso crea el paso 2");
ok((await p.locator("[data-trazo-editable]").count()) === 1, "el paso 1 tiene un trazo");
await p.keyboard.press("v");
await p.locator("[data-trazo-editable] path").nth(1).click({ force: true });
ok((await p.locator("[data-control]").count()) === 1, "tocar el trazo muestra la manija de curva");
await p.screenshot({ path: "capturas/m7/editor-1440-trazo.png" });
await p.keyboard.press("]");
await p.waitForTimeout(100);
ok((await p.locator("[data-trazo-editable]").count()) === 0, "] pasa al paso 2 (sin trazos)");
await p.keyboard.press("[");

// Ficha y guardado.
await p.getByPlaceholder("Nombre del ejercicio…").fill("Rondo del profe");
await p.getByPlaceholder("Qué tienen que hacer…").fill("Tres contra uno, a dos toques.");
ok(await p.getByText("Listo.").isVisible(), "con nombre, consigna y fichas queda listo");
await p.keyboard.press("Control+s");
await p.waitForURL(/editor\?id=p-/);
ok(await p.getByText("Guardado").isVisible(), "Ctrl+S guarda y la URL toma el id");
const guardado = await p.evaluate(async () => {
  const id = new URL(location.href).searchParams.get("id");
  return await new Promise((res) => {
    const r = indexedDB.open("playbook");
    r.onsuccess = () => {
      const tx = r.result.transaction("ejercicios").objectStore("ejercicios").get(id);
      tx.onsuccess = () => res(tx.result);
    };
  });
});
ok(guardado?.estado === "listo" && guardado.pizarra.pasos.length === 2 && guardado.pizarra.elementos.length === 4, "en IndexedDB quedó listo, con 2 pasos y 4 elementos");

// La animación de lo armado.
await p.getByRole("button", { name: "Ver animación" }).click();
await p.waitForTimeout(700);
await p.screenshot({ path: "capturas/m7/editor-1440-animacion.png" });
await p.getByRole("button", { name: "Volver a editar" }).click();

// Recargar: vuelve tal cual.
await p.reload({ waitUntil: "networkidle" });
await p.waitForSelector("[data-mov]");
ok((await p.getByPlaceholder("Nombre del ejercicio…").inputValue()) === "Rondo del profe", "al recargar vuelve el ejercicio");
await p.screenshot({ path: "capturas/m7/editor-1440.png" });

ok(errores.length === 0, `sin errores en consola${errores.length ? ": " + errores.join(" | ") : ""}`);
await b.close();
