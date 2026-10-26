// Formulario de feedback de la beta (390 × 844) contra un Google Form simulado con page.route.
// Requiere el build con el Form configurado:
//   NEXT_PUBLIC_FEEDBACK_FORM_URL=https://docs.google.com/forms/d/e/1FAIpQLSprueba/formResponse
//   NEXT_PUBLIC_FEEDBACK_ENTRIES='<el JSON de ENTRIES de abajo>'
//   npm run build && npm start -- -p 3100
// Uso: node e2e/feedback.mjs [base]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const salida = "capturas/feedback";
mkdirSync(salida, { recursive: true });
export const FORM = "https://docs.google.com/forms/d/e/1FAIpQLSprueba/formResponse";
export const ENTRIES = Object.fromEntries(
  ["categorias", "usos", "tal_cual", "ejercicio_malo", "ejercicio", "falto", "seguiria", "por_que", "contacto", "calificacion", "origen", "version", "dispositivo", "pwa", "sesiones", "cancha", "propios"].map((c, i) => [c, `entry.${1000 + i}`]),
);
const campo = (cuerpo, c) => cuerpo.get(ENTRIES[c]);

const ok = (cond, msg) => {
  if (!cond) {
    console.error("✗", msg);
    process.exitCode = 1;
  } else console.log("✓", msg);
};

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
// Sin service worker: así page.route ve el POST al Form (si no, lo atiende el SW).
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, serviceWorkers: "block" });
const recibidos = [];
await ctx.route(FORM, async (route) => {
  recibidos.push(new URLSearchParams(route.request().postData() ?? ""));
  await route.fulfill({ status: 200, contentType: "text/html", body: "<html>ok</html>" });
});
const p = await ctx.newPage();
const errores = [];
// Con el service worker bloqueado (para ver el POST), el registro de Serwist falla con "reading 'waiting'":
// es del entorno de prueba, no de la app.
const ajeno = /vibrate|Failed to load resource|ERR_INTERNET_DISCONNECTED|reading 'waiting'/;
p.on("pageerror", (e) => !ajeno.test(String(e)) && errores.push(String(e)));
p.on("console", (m) => m.type() === "error" && !ajeno.test(m.text()) && errores.push(m.text()));
const esperarEnvio = async (n, ms = 6000) => {
  const t0 = Date.now();
  while (recibidos.length < n && Date.now() - t0 < ms) await p.waitForTimeout(100);
  return recibidos.length >= n;
};
const hoja = () => p.getByRole("dialog", { name: "Contanos qué onda" });
const pendientes = () =>
  p.evaluate(
    () =>
      new Promise((ok2) => {
        const r = indexedDB.open("playbook");
        r.onsuccess = () => {
          const c = r.result.transaction("feedback").objectStore("feedback").count();
          c.onsuccess = () => ok2(c.result);
        };
      }),
  );

/** Las obligatorias: categoría, usos, "tal cual" y si la seguiría usando. */
async function completarObligatorias() {
  const h = hoja();
  await h.getByRole("button", { name: "Juveniles" }).click();
  await h.getByRole("button", { name: "Mayores" }).click();
  await h.locator('label:has(input[name="fb-usos"][value="2–3"])').click();
  await h.locator('label:has(input[name="fb-tal-cual"][value="4"])').click();
  await h.locator('label:has(input[name="fb-seguiria"][value="Sí"])').click();
}

// --- 1. Bienvenida y flujo completo desde el inicio ---------------------------------------
await p.goto(`${base}/`, { waitUntil: "networkidle" });
ok(await p.getByRole("heading", { name: "Esto es una beta. Rompela y contanos." }).waitFor({ timeout: 5000 }).then(() => true, () => false), "la primera vez aparece el cartel de la beta");
await p.screenshot({ path: `${salida}/1-inicio-bienvenida-390.png` });
await p.getByRole("button", { name: "Dale" }).click();
await p.reload({ waitUntil: "networkidle" });
await p.waitForTimeout(500);
ok((await p.getByRole("heading", { name: "Esto es una beta. Rompela y contanos." }).count()) === 0, "con “Dale” no vuelve a aparecer (queda en IndexedDB)");
await p.screenshot({ path: `${salida}/2-inicio-acceso-390.png` });

const t0 = Date.now();
await p.getByRole("button", { name: /Contanos qué onda/ }).click();
await hoja().waitFor();
await p.waitForTimeout(400);
await p.screenshot({ path: `${salida}/3-hoja-390.png` });
await hoja().getByRole("button", { name: "Mandar" }).click();
ok(await hoja().getByRole("alert").filter({ hasText: "Te faltan 4 preguntas" }).isVisible(), "sin las obligatorias, avisa cuántas faltan");
ok((await p.evaluate(() => document.activeElement?.id)) === "fb-p-categorias", "y lleva el foco a la primera que falta");
await p.screenshot({ path: `${salida}/4-hoja-faltan-390.png` });
await completarObligatorias();
const h = hoja();
await h.locator("#fb-ejercicio-elegido").selectOption("rondo-3-contra-1");
await h.locator("#fb-ejercicio-malo").fill("No queda claro quién rota al medio.");
await h.locator("#fb-falto").fill("Ejercicios de córner corto.");
await h.locator("#fb-por-que").fill("Me ahorra media hora de planificar.");
await h.locator("#fb-contacto").fill("Caro, Club Atlético");
await p.screenshot({ path: `${salida}/5-hoja-completa-390.png` });
await h.getByRole("button", { name: "Mandar" }).click();
ok(await esperarEnvio(1), "manda al Google Form (POST interceptado)");
const segundos = (Date.now() - t0) / 1000;
const c1 = recibidos[0];
ok(campo(c1, "categorias") === "Juveniles, Mayores" && campo(c1, "usos") === "2–3" && campo(c1, "tal_cual") === "4 · Casi tal cual" && campo(c1, "seguiria") === "Sí", "con las respuestas en sus entry");
ok(campo(c1, "ejercicio") === "Rondo 3 contra 1 (rondo-3-contra-1)" && campo(c1, "contacto") === "Caro, Club Atlético" && campo(c1, "origen") === "inicio", "incluido el ejercicio elegido, el contacto y de dónde salió");
ok(/^[0-9a-f]{7}$|^dev$/.test(campo(c1, "version") ?? "") && /^\w+ · Chrome \d+$/.test(campo(c1, "dispositivo") ?? "") && campo(c1, "pwa") === "No", `con la info técnica (v${campo(c1, "version")}, ${campo(c1, "dispositivo")})`);
ok(await hoja().getByText("¡Gracias, crack!").isVisible() && (await hoja().getByText("Lo leemos todo.").isVisible()), `confirma “¡Gracias, crack! Lo leemos todo.” (${segundos.toFixed(1)} s con toques automáticos)`);
await p.screenshot({ path: `${salida}/6-gracias-390.png` });
await hoja().getByRole("button", { name: "Listo" }).click();
ok((await hoja().count()) === 0, "“Listo” cierra la hoja");

// --- 2. Desde la ficha: la pregunta 4 viene precargada --------------------------------------
await p.goto(`${base}/ficha?id=rondo-3-contra-1`, { waitUntil: "networkidle" });
await p.getByRole("button", { name: "Este ejercicio está flojo" }).click();
await hoja().waitFor();
await p.waitForTimeout(400);
ok((await hoja().locator("#fb-ejercicio-elegido").inputValue()) === "rondo-3-contra-1", "“Este ejercicio está flojo” abre con ese ejercicio elegido");
await p.screenshot({ path: `${salida}/7-desde-ficha-390.png` });
await p.keyboard.press("Escape");
ok((await hoja().count()) === 0, "Escape cierra la hoja");

// --- 3. Fin del modo cancha ---------------------------------------------------------------
await p.goto(`${base}/armar`, { waitUntil: "networkidle" });
await p.getByRole("link", { name: "Seguir" }).click();
await p.getByRole("button", { name: "Armame la sesión" }).tap();
await p.getByRole("heading", { name: "Tu sesión" }).waitFor({ timeout: 15000 });
await p.getByRole("button", { name: "¡A la cancha!" }).tap();
await p.waitForURL(/\/cancha\?id=/);
await p.getByRole("timer").waitFor();
const idSesion = new URL(p.url()).searchParams.get("id");
const items = await p.evaluate(
  (id) =>
    new Promise((ok2) => {
      const r = indexedDB.open("playbook");
      r.onsuccess = () => {
        const g = r.result.transaction("sesiones").objectStore("sesiones").get(id);
        g.onsuccess = () => ok2(g.result.items.length);
      };
    }),
  idSesion,
);
// Se salta al último bloque con 1,5 s por delante (el mismo truco que e2e/cancha.mjs).
await p.evaluate(([k, i]) => localStorage.setItem(k, JSON.stringify({ indice: i, finEn: Date.now() + 1500, restanteMs: 1500, completa: false })), [`pb-cancha-${idSesion}`, items - 1]);
await p.reload({ waitUntil: "networkidle" });
await p.getByText("¡Tiempo!").first().waitFor({ timeout: 8000 });
await p.getByRole("button", { name: /^Terminar/ }).click();
ok(await p.getByRole("heading", { name: "¡Terminó el entrenamiento!" }).waitFor({ timeout: 5000 }).then(() => true, () => false), "al terminar el último bloque aparece el cierre");
ok(await p.getByText("¿Cómo te fue con la sesión?").isVisible(), "con “¿Cómo te fue con la sesión?”");
await p.screenshot({ path: `${salida}/8-cierre-cancha-390.png` });
await p.getByRole("button", { name: "4 de 5" }).click();
ok(await esperarEnvio(2), "la calificación rápida se manda sola");
const c2 = recibidos[1];
ok(campo(c2, "calificacion") === "4" && campo(c2, "origen") === "cierre" && !c2.has(ENTRIES.categorias), "con la nota y sin las preguntas del formulario");
ok(campo(c2, "sesiones") === "1" && campo(c2, "cancha") === "1", `los contadores van en la info técnica (sesiones ${campo(c2, "sesiones")}, cancha ${campo(c2, "cancha")})`);
ok(await p.getByText("¡Gracias, crack! Lo leemos todo.").isVisible(), "y agradece");
await p.screenshot({ path: `${salida}/9-cierre-calificado-390.png` });
await p.getByRole("button", { name: "Contame más" }).click();
await hoja().waitFor();
await p.waitForTimeout(400);
ok(await hoja().getByText("a la sesión. Contanos el resto:").isVisible(), "“Contame más” abre el formulario con la nota");
await p.screenshot({ path: `${salida}/10-contame-mas-390.png` });
await p.keyboard.press("Escape");
await p.reload({ waitUntil: "networkidle" });
await p.getByRole("button", { name: "Saltear" }).click();
await p.waitForURL((u) => new URL(u).pathname === "/");
ok(true, "“Saltear” vuelve al inicio con un toque");

// --- 4. Sin señal: se guarda y sale solo al volver, sin recargar ----------------------------
await p.goto(`${base}/mi-club`, { waitUntil: "networkidle" });
await p.evaluate(() => (window.__sinRecargar = true));
await p.getByRole("button", { name: "Mandar feedback" }).click();
await hoja().waitFor();
await completarObligatorias();
await ctx.setOffline(true);
const antes = recibidos.length;
await hoja().getByRole("button", { name: "Mandar" }).click();
ok(await hoja().getByText("Lo mandamos cuando vuelva la señal.").waitFor({ timeout: 4000 }).then(() => true, () => false), "sin señal avisa “Lo mandamos cuando vuelva la señal”");
ok((await pendientes()) === 1, "y la respuesta queda en la cola de Dexie");
await p.screenshot({ path: `${salida}/11-sin-senal-390.png` });
await ctx.setOffline(false);
ok(await esperarEnvio(antes + 1), "al volver la señal sale sola");
ok(campo(recibidos[antes], "origen") === "mi-club", "es la respuesta que había quedado (desde Mi club)");
ok((await pendientes()) === 0, "la cola queda vacía");
ok(await p.evaluate(() => window.__sinRecargar === true), "sin recargar la página");

ok(errores.length === 0, `sin errores en consola${errores.length ? ": " + errores.join(" | ") : ""}`);

// --- 5. En la compu es un modal -----------------------------------------------------------
const compu = await b.newPage({ viewport: { width: 1440, height: 900 } });
await compu.goto(`${base}/mi-club`, { waitUntil: "networkidle" });
await compu.getByRole("button", { name: "Mandar feedback" }).click();
await compu.waitForTimeout(500);
await compu.screenshot({ path: `${salida}/12-modal-1440.png` });
await b.close();
