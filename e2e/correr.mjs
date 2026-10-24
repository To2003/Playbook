// Corre las pruebas de punta a punta en orden contra un server ya levantado.
// Uso: npm run e2e                      (contra http://localhost:3000, server de `npm run dev`)
//      BASE=http://localhost:3100 npm run e2e   (contra `npm run build && npm start -- -p 3100`;
//                                                 suma la verificación final con offline y video)
// `nube-mock.mjs` necesita el server con NEXT_PUBLIC_SUPABASE_URL=https://prueba.supabase.test
// y NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-de-prueba: se corre aparte (ver README).
import { spawnSync } from "node:child_process";

const base = process.env.BASE ?? "http://localhost:3000";
const produccion = !base.endsWith(":3000");
const suites = ["flujo", "cancha", "cancha-aviso", "editor", "boceto", "exportar", "nube", ...(produccion ? ["final"] : [])];
const resultados = [];
for (const s of suites) {
  const r = spawnSync("node", [`e2e/${s}.mjs`, base], { env: { ...process.env, BASE: base }, encoding: "utf8" });
  const salida = `${r.stdout}${r.stderr}`;
  const fallas = (salida.match(/✗.*/g) ?? []).concat(r.status !== 0 && !salida.includes("✗") ? [`salió con ${r.status}`] : []);
  resultados.push({ s, bien: (salida.match(/✓/g) ?? []).length, fallas });
  console.log(`${fallas.length ? "✗" : "✓"} ${s}: ${(salida.match(/✓/g) ?? []).length || "informe JSON, sin"} chequeos${fallas.length ? `\n    ${fallas.join("\n    ")}` : ""}`);
}
process.exitCode = resultados.some((r) => r.fallas.length) ? 1 : 0;
