// M8 con la nube "encendida" contra un Supabase simulado (Playwright intercepta la API).
// Requiere el server levantado con:
//   NEXT_PUBLIC_SUPABASE_URL=https://prueba.supabase.test NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-de-prueba
// Uso: node e2e/nube-mock.mjs [base]
// Cubre: login (sesión inyectada), criterio 7 (5 pasos en la compu → aparece animado en el celu)
// y criterio 9 (el link compartido abre sin login y reproduce la animación). El store en memoria
// aplica las mismas reglas que las políticas RLS de supabase/migrations.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const NUBE = "https://prueba.supabase.test";
const UID = "7f0c2a59-2a7e-4a4f-9d6a-0b1f5c3e9a11";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const TOKEN = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: UID, role: "authenticated", exp: 4102444800 })}.firma`;
mkdirSync("capturas/m8", { recursive: true });

const ok = (cond, msg) => {
  if (!cond) {
    console.error("✗", msg);
    process.exitCode = 1;
  } else console.log("✓", msg);
};

// --- Supabase simulado ---------------------------------------------------------------
const tablas = { ejercicios: new Map(), sesiones: new Map(), ajustes: new Map() };
const llamadas = [];
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS", "access-control-expose-headers": "*" };

function visibles(tabla, uid) {
  return [...tablas[tabla].values()].filter((f) => (uid && f.autor === uid) || (tabla === "ejercicios" && f.compartido && !f.borrado));
}
function filtrar(filas, params) {
  for (const [k, v] of params) {
    if (["select", "on_conflict", "limit", "order", "columns"].includes(k)) continue;
    const [op, ...resto] = v.split(".");
    const valor = resto.join(".");
    filas = filas.filter((f) => {
      const x = f[k];
      if (op === "eq") return String(x) === valor;
      if (op === "gt") return Number(x) > Number(valor);
      return true;
    });
  }
  return filas;
}
async function apiNube(route) {
  const req = route.request();
  if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
  const url = new URL(req.url());
  if (url.pathname.startsWith("/auth/v1/")) return route.fulfill({ status: 204, headers: cors });
  const tabla = url.pathname.replace("/rest/v1/", "");
  const bearer = (req.headers()["authorization"] ?? "").replace("Bearer ", "");
  const uid = bearer === TOKEN ? UID : null;
  llamadas.push(`${req.method()} ${tabla}${uid ? "" : " (anon)"}`);
  const json = (status, cuerpo) => route.fulfill({ status, headers: { ...cors, "content-type": "application/json" }, body: cuerpo === undefined ? "" : JSON.stringify(cuerpo) });
  if (req.method() === "GET") {
    const filas = filtrar(visibles(tabla, uid), url.searchParams);
    const cols = url.searchParams.get("select")?.split(",").map((c) => c.trim());
    const recorte = filas.map((f) => (cols && cols[0] !== "*" ? Object.fromEntries(cols.map((c) => [c, f[c]])) : f));
    if ((req.headers()["accept"] ?? "").includes("vnd.pgrst.object")) {
      if (recorte.length === 1) return json(200, recorte[0]);
      return json(406, { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned", details: `The result contains ${recorte.length} rows`, hint: null });
    }
    return json(200, recorte);
  }
  if (req.method() === "POST") {
    if (!uid) return json(401, { message: "anon no escribe" });
    const clave = url.searchParams.get("on_conflict") ?? "id";
    for (const fila of JSON.parse(req.postData() ?? "[]")) {
      // WITH CHECK (auth.uid() = autor) y USING en el update: nadie pisa filas ajenas.
      const previa = tablas[tabla].get(fila[clave]);
      if (fila.autor !== uid || (previa && previa.autor !== uid)) return json(403, { code: "42501", message: "new row violates row-level security policy" });
      tablas[tabla].set(fila[clave], { ...previa, ...fila });
    }
    return json(201);
  }
  return json(405, { message: "no simulado" });
}

const sesionGuardada = {
  access_token: TOKEN,
  refresh_token: "refresco-de-prueba",
  token_type: "bearer",
  expires_in: 3600 * 24 * 365,
  expires_at: 4102444800,
  user: { id: UID, aud: "authenticated", role: "authenticated", email: "profe@club.test", app_metadata: { provider: "google" }, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" },
};

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
async function contexto(opciones, conSesion) {
  const ctx = await b.newContext(opciones);
  await ctx.route(`${NUBE}/**`, apiNube);
  if (conSesion) await ctx.addInitScript((s) => localStorage.setItem("sb-prueba-auth-token", JSON.stringify(s)), sesionGuardada);
  const p = await ctx.newPage();
  const errores = [];
  p.on("pageerror", (e) => errores.push(String(e)));
  p.on("console", (m) => m.type() === "error" && !m.text().includes("vibrate") && errores.push(m.text()));
  return { ctx, p, errores };
}
const esperar = async (cond, ms = 8000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await cond()) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
};

// 1. Compu con sesión: Mi club muestra la cuenta.
const compu = await contexto({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] }, true);
await compu.p.goto(`${base}/mi-club`, { waitUntil: "networkidle" });
ok(await compu.p.getByText("profe@club.test").waitFor({ timeout: 8000 }).then(() => true, () => false), "con sesión, Mi club muestra la cuenta");
ok(await esperar(() => compu.p.getByText(/Sincronizado a las/).isVisible()), "al entrar sincroniza");
await compu.p.screenshot({ path: "capturas/m8/mi-club-con-cuenta-1440.png" });

// 2. Criterio 7: ejercicio de 5 pasos en el editor.
await compu.p.goto(`${base}/editor`, { waitUntil: "networkidle" });
await compu.p.waitForSelector('svg[aria-label="Pizarra editable"]');
const paleta = (n) => compu.p.getByRole("list", { name: "Elementos para agregar" }).getByRole("button", { name: new RegExp(`^${n}`) });
await paleta("Equipo A").click();
await compu.p.keyboard.press("Escape");
await compu.p.keyboard.press("d");
for (let i = 0; i < 4; i++) {
  await compu.p.keyboard.press("]");
  const c = await compu.p.locator('[data-mov="a1"]').boundingBox();
  const x = c.x + c.width / 2;
  const y = c.y + c.height / 2;
  await compu.p.mouse.move(x, y);
  await compu.p.mouse.down();
  await compu.p.mouse.move(x + (i % 2 ? -70 : 70), y - 45, { steps: 8 });
  await compu.p.mouse.up();
}
await compu.p.getByPlaceholder("Nombre del ejercicio").fill("Salida en cinco pasos");
await compu.p.getByPlaceholder("Qué tienen que hacer.").fill("Recibe, gira y sale por el costado.");
await compu.p.keyboard.press("Control+s");
await compu.p.waitForURL(/editor\?id=p-/);
const id = new URL(compu.p.url()).searchParams.get("id");
ok(await esperar(() => tablas.ejercicios.get(id)?.datos?.pizarra?.pasos?.length === 5), "el ejercicio de 5 pasos se sube solo a la nube");

// 3. El celu (otro dispositivo, misma cuenta) lo baja y lo anima.
const celu = await contexto({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }, true);
await celu.p.goto(`${base}/mis-ejercicios`, { waitUntil: "networkidle" });
ok(await celu.p.getByRole("link", { name: /Salida en cinco pasos/ }).waitFor({ timeout: 10000 }).then(() => true, () => false), "criterio 7: aparece en el celu después de sincronizar");
await celu.p.getByRole("link", { name: /Salida en cinco pasos/ }).click();
await celu.p.waitForURL(/ficha/);
ok(await celu.p.getByText("1/5").or(celu.p.getByText("2/5")).first().waitFor({ timeout: 5000 }).then(() => true, () => false), "en el celu la pizarra tiene los 5 pasos");
await celu.p.waitForTimeout(1500);
await celu.p.screenshot({ path: "capturas/m8/celu-despues-de-sync-390.png" });

// 4. Compartir link desde la compu.
await compu.p.goto(`${base}/ficha?id=${encodeURIComponent(id)}`, { waitUntil: "networkidle" });
await compu.p.getByRole("button", { name: "Compartir link" }).click();
ok(await compu.p.getByText("Link copiado.").waitFor({ timeout: 8000 }).then(() => true, () => false), "Compartir link sube y copia el link");
const link = await compu.p.getByRole("textbox", { name: "Link para compartir" }).inputValue();
ok(link.endsWith(`/e/${id}`) && tablas.ejercicios.get(id)?.compartido === true, `el link es ${link.replace(base, "")} y en la nube quedó compartido`);
await compu.p.screenshot({ path: "capturas/m8/compartir-1440.png" });

// 5. Criterio 9: sin login, otro celu abre el link y ve la animación.
const otro = await contexto({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }, false);
await otro.p.goto(link, { waitUntil: "networkidle" });
ok(await otro.p.getByRole("heading", { name: "Salida en cinco pasos" }).waitFor({ timeout: 8000 }).then(() => true, () => false), "criterio 9: el link abre sin login");
const paso1 = await otro.p.locator("text=/^\\d\\/5$/").first().textContent();
await otro.p.waitForTimeout(2500);
const paso2 = await otro.p.locator("text=/^\\d\\/5$/").first().textContent();
ok(paso1 !== paso2, `y reproduce la animación (${paso1} → ${paso2})`);
await otro.p.screenshot({ path: "capturas/m8/link-sin-login-390.png" });
ok(!llamadas.some((l) => l.startsWith("POST") && l.endsWith("(anon)")), "sin login no se escribe nada en la nube");

// 6. Un privado no se ve por link.
tablas.ejercicios.set("p-privado", { id: "p-privado", autor: UID, datos: { nombre: "Privado" }, compartido: false, borrado: false, actualizado: 1 });
await otro.p.goto(`${base}/e/p-privado`, { waitUntil: "networkidle" });
ok(await otro.p.getByRole("heading", { name: "Este ejercicio ya no está compartido" }).waitFor({ timeout: 8000 }).then(() => true, () => false), "un ejercicio privado no se abre por link");

// 7. Salir.
await compu.p.goto(`${base}/mi-club`, { waitUntil: "networkidle" });
await compu.p.getByRole("button", { name: "Salir" }).click();
ok(await compu.p.getByRole("button", { name: "Entrar con Google" }).waitFor({ timeout: 5000 }).then(() => true, () => false), "Salir vuelve a mostrar Entrar con Google");

for (const [n, c] of [["compu", compu], ["celu", celu], ["otro", otro]]) ok(c.errores.length === 0, `${n}: sin errores en consola${c.errores.length ? ": " + c.errores.join(" | ") : ""}`);
console.log("API:", [...new Set(llamadas)].join(", "));
await b.close();
