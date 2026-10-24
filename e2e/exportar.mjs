// Exportar PNG desde la ficha: node e2e/exportar.mjs [base]
// Descarga el póster de dos ejercicios (vista completa y media), chequea 1080 × 1350 y lo deja en capturas/m9.
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
mkdirSync("capturas/m9", { recursive: true });
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const errores = [];
p.on("pageerror", (e) => errores.push(String(e)));
p.on("console", (m) => m.type() === "error" && errores.push(m.text()));
const ok = (cond, msg) => {
  if (!cond) {
    console.error("✗", msg);
    process.exitCode = 1;
  } else console.log("✓", msg);
};

for (const id of ["push-recepcion-orientada-triangulos", "rondo-3-contra-1", "arq-desplazamientos-laterales"]) {
  await p.goto(`${base}/ficha?id=${id}`, { waitUntil: "networkidle" });
  const boton = p.getByRole("button", { name: "Exportar PNG" });
  if (!(await boton.count())) {
    ok(false, `${id}: no está el botón (¿existe el ejercicio?)`);
    continue;
  }
  const [descarga] = await Promise.all([p.waitForEvent("download"), boton.click()]);
  const ruta = `capturas/m9/${descarga.suggestedFilename()}`;
  await descarga.saveAs(ruta);
  const png = readFileSync(ruta);
  const ancho = png.readUInt32BE(16);
  const alto = png.readUInt32BE(20);
  ok(png.subarray(1, 4).toString() === "PNG" && ancho === 1080 && alto === 1350, `${id}: PNG ${ancho} × ${alto} (${Math.round(png.length / 1024)} KB) → ${ruta}`);
  ok(png.length < 1.5 * 1024 * 1024, `${id}: pesa menos de 1,5 MB (WhatsApp no lo recomprime fuerte)`);
  ok(await p.getByText("Se descargó la imagen.").isVisible(), `${id}: avisa que se descargó`);
}
ok(errores.length === 0, `sin errores en consola${errores.length ? ": " + errores.join(" | ") : ""}`);
await b.close();
