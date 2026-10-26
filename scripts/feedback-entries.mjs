// Saca las variables del feedback desde el "vínculo prellenado" de Google Forms.
// En el prellenado, escribí en cada pregunta el nombre de su campo (categorias, usos, tal_cual…).
// Uso: node scripts/feedback-entries.mjs "https://docs.google.com/forms/d/e/XXXX/viewform?usp=pp_url&entry.123=categorias&…"
const CAMPOS = ["categorias", "usos", "tal_cual", "ejercicio_malo", "ejercicio", "falto", "seguiria", "por_que", "contacto", "calificacion", "origen", "version", "dispositivo", "pwa", "sesiones", "cancha", "propios"];

const link = process.argv[2];
if (!link) {
  console.error('Pasale el vínculo prellenado entre comillas: node scripts/feedback-entries.mjs "https://docs.google.com/forms/d/e/…/viewform?usp=pp_url&entry.…"');
  process.exit(1);
}
const url = new URL(link);
const entries = {};
for (const [clave, valor] of url.searchParams) {
  const campo = valor.trim().toLowerCase();
  if (/^entry\.\d+$/.test(clave) && CAMPOS.includes(campo)) entries[campo] = clave;
}
const faltan = CAMPOS.filter((c) => !entries[c]);
const formResponse = `${url.origin}${url.pathname.replace(/\/viewform$/, "/formResponse")}`;
console.log(`NEXT_PUBLIC_FEEDBACK_FORM_URL=${formResponse}`);
console.log(`NEXT_PUBLIC_FEEDBACK_ENTRIES=${JSON.stringify(entries)}`);
if (faltan.length) console.error(`\nOjo: no encontré ${faltan.join(", ")}. Esos campos no se van a mandar.`);
