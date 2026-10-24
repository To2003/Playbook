// M8 sin variables de Supabase (la app 100 % local): node e2e/nube.mjs [base]
// - "Compartir link" pide login, Mi club guarda ajustes y avisa que la cuenta no está activada,
// - /e/<id> abre un ejercicio base sin login y "Usalo en Playbook" lo copia.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
mkdirSync("capturas/m8", { recursive: true });
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
const errores = [];
p.on("pageerror", (e) => errores.push(String(e)));
p.on("console", (m) => m.type() === "error" && errores.push(m.text()));
const ok = (cond, msg) => {
  if (!cond) {
    console.error("✗", msg);
    process.exitCode = 1;
  } else console.log("✓", msg);
};

await p.goto(`${base}/ficha?id=rondo-3-contra-1`, { waitUntil: "networkidle" });
await p.getByRole("button", { name: "Compartir link" }).click();
ok(await p.getByText("Iniciá sesión para compartir").isVisible(), "sin cuenta, Compartir link dice “Iniciá sesión para compartir”");
await p.screenshot({ path: "capturas/m8/compartir-sin-cuenta-390.png" });

await p.goto(`${base}/mi-club`, { waitUntil: "networkidle" });
await p.getByRole("heading", { name: "Cuenta" }).waitFor();
ok(await p.getByText("todavía no está activada").isVisible(), "Mi club explica que la cuenta no está activada");
ok((await p.getByRole("button", { name: "Entrar con Google" }).count()) === 0, "sin variables no aparece el login");
await p.getByRole("group", { name: "Sesión completa" }).getByText("75", { exact: true }).click();
await p.getByRole("button", { name: "Más arcos chicos" }).click();
await p.getByRole("group", { name: "Tema" }).getByText("Claro").click();
await p.waitForTimeout(300);
ok((await p.evaluate(() => document.documentElement.dataset.tema)) === "claro", "el tema claro se aplica");
await p.screenshot({ path: "capturas/m8/mi-club-390.png", fullPage: true });
await p.reload({ waitUntil: "networkidle" });
await p.getByRole("heading", { name: "Cuenta" }).waitFor();
ok(await p.getByRole("group", { name: "Sesión completa" }).getByRole("radio", { name: "75 minutos" }).isChecked(), "la duración elegida queda guardada");
await p.getByRole("group", { name: "Tema" }).getByText("Oscuro").click();
await p.goto(`${base}/`, { waitUntil: "networkidle" });
ok(await p.getByText("75 min").first().isVisible(), "el inicio muestra la duración de Mi club");

await p.goto(`${base}/e/rondo-3-contra-1`, { waitUntil: "networkidle" });
ok(await p.getByRole("heading", { name: "Rondo 3 contra 1" }).isVisible(), "/e/<id> abre un base sin login");
await p.screenshot({ path: "capturas/m8/compartido-390.png" });
await p.getByRole("button", { name: "Usalo en Playbook" }).click();
await p.waitForURL(/ficha\?id=p-/);
ok(await p.getByText("Mío").first().waitFor({ timeout: 5000 }).then(() => true, () => false), "Usalo en Playbook lo copia a Mis ejercicios");

await p.goto(`${base}/e/p-no-existe`, { waitUntil: "networkidle" });
ok(await p.getByRole("heading", { name: "Este ejercicio ya no está compartido" }).isVisible(), "un link que no existe avisa sin romperse");

ok(errores.length === 0, `sin errores en consola${errores.length ? ": " + errores.join(" | ") : ""}`);
await b.close();
