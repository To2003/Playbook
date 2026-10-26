/**
 * Formulario de feedback de la beta: preguntas, validación y cómo se arma lo que se manda.
 * Todo puro (sin navegador) para poder probarlo.
 */

export const CATEGORIAS = ["Menores", "Juveniles", "Mayores", "Veteranos"] as const;
export const USOS = ["0", "1", "2–3", "4 o más"] as const;
export const SEGUIRIA = ["Sí", "No", "Tal vez"] as const;
/** Escala de "¿La usarías tal cual?": las puntas son las del pedido; el medio, para que cada número diga algo. */
export const ESCALA: Record<1 | 2 | 3 | 4 | 5, string> = { 1: "Ni loco", 2: "Casi nada", 3: "Con cambios", 4: "Casi tal cual", 5: "Tal cual" };

export type Origen = "inicio" | "cierre" | "mi-club" | "ficha";

export interface Respuesta {
  origen: Origen;
  categorias: string[];
  usos?: string;
  talCual?: number;
  ejercicioMalo: string;
  /** Ejercicio elegido en la pregunta 4 (id de la biblioteca). */
  ejercicioId?: string;
  falto: string;
  seguiria?: string;
  porQue: string;
  contacto: string;
  /** Calificación rápida (1 a 5) del cierre del modo cancha. */
  calificacion?: number;
}

/** Info técnica que se adjunta: nada personal. */
export interface Tecnico {
  version: string;
  dispositivo: string;
  pwa: boolean;
  sesiones: number;
  cancha: number;
  propios: number;
}

/**
 * Los campos que se mandan. Cada uno se mapea a un `entry.XXXX` del Google Form; los que no tienen
 * entry no viajan. `info` junta en un solo texto el origen, la calificación del cierre y la info
 * técnica, para un Form con una sola pregunta para eso.
 */
export const CAMPOS = [
  "categorias",
  "usos",
  "tal_cual",
  "ejercicio_malo",
  "ejercicio",
  "falto",
  "seguiria",
  "por_que",
  "contacto",
  "calificacion",
  "origen",
  "version",
  "dispositivo",
  "pwa",
  "sesiones",
  "cancha",
  "propios",
  "info",
] as const;
export type Campo = (typeof CAMPOS)[number];
export type Entries = Partial<Record<Campo, string>>;

export const respuestaVacia = (origen: Origen): Respuesta => ({ origen, categorias: [], ejercicioMalo: "", falto: "", porQue: "", contacto: "" });

/** Las obligatorias (1, 2, 3 y 6) que faltan, en el orden del formulario. */
export function faltantes(r: Respuesta): ("categorias" | "usos" | "tal_cual" | "seguiria")[] {
  const f: ("categorias" | "usos" | "tal_cual" | "seguiria")[] = [];
  if (!r.categorias.length) f.push("categorias");
  if (!r.usos) f.push("usos");
  if (!r.talCual) f.push("tal_cual");
  if (!r.seguiria) f.push("seguiria");
  return f;
}

const cuantos = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/** Cada campo como texto. Los vacíos quedan vacíos (no se mandan). */
export function valores(r: Respuesta, t: Tecnico, nombreEjercicio?: string): Record<Campo, string> {
  return {
    categorias: r.categorias.join(", "),
    usos: r.usos ?? "",
    // Solo el número: es lo que acepta una pregunta de escala lineal (y una de texto también).
    tal_cual: r.talCual ? String(r.talCual) : "",
    ejercicio_malo: r.ejercicioMalo.trim(),
    ejercicio: r.ejercicioId ? (nombreEjercicio ? `${nombreEjercicio} (${r.ejercicioId})` : r.ejercicioId) : "",
    falto: r.falto.trim(),
    seguiria: r.seguiria ?? "",
    por_que: r.porQue.trim(),
    contacto: r.contacto.trim(),
    calificacion: r.calificacion ? String(r.calificacion) : "",
    origen: r.origen,
    version: t.version,
    dispositivo: t.dispositivo,
    pwa: t.pwa ? "Sí" : "No",
    sesiones: String(t.sesiones),
    cancha: String(t.cancha),
    propios: String(t.propios),
    info: [
      `Desde: ${r.origen}`,
      r.calificacion ? `Calificación de la sesión: ${r.calificacion}/5` : "",
      `v${t.version}`,
      t.dispositivo,
      t.pwa ? "instalada" : "en el navegador",
      cuantos(t.sesiones, "sesión", "sesiones"),
      `${cuantos(t.cancha, "vez", "veces")} en modo cancha`,
      cuantos(t.propios, "ejercicio propio", "ejercicios propios"),
    ]
      .filter(Boolean)
      .join(" · "),
  };
}

/** Body para el Google Form: solo los campos que tienen `entry` y algo para decir. */
export function armarCuerpo(r: Respuesta, t: Tecnico, entries: Entries, nombreEjercicio?: string): URLSearchParams {
  const v = valores(r, t, nombreEjercicio);
  const cuerpo = new URLSearchParams();
  for (const campo of CAMPOS) {
    const entry = entries[campo];
    if (!entry) continue;
    // Casillas de verificación: Google espera un parámetro por cada opción marcada.
    if (campo === "categorias") r.categorias.forEach((c) => cuerpo.append(entry, c));
    else if (v[campo]) cuerpo.append(entry, v[campo]);
  }
  return cuerpo;
}

const RENGLONES: [Campo, string][] = [
  ["calificacion", "Cómo me fue con la sesión (1 a 5)"],
  ["categorias", "Categoría"],
  ["usos", "Veces que la usé en la cancha"],
  ["tal_cual", "¿La usaría tal cual? (1 a 5)"],
  ["ejercicio", "Ejercicio flojo"],
  ["ejercicio_malo", "Qué tenía de malo"],
  ["falto", "Qué me faltó"],
  ["seguiria", "¿La seguiría usando?"],
  ["por_que", "Por qué"],
  ["contacto", "Nombre y club"],
];

/** Las respuestas en texto, para mandar por WhatsApp o copiar. */
export function textoFeedback(r: Respuesta, t: Tecnico, nombreEjercicio?: string): string {
  const v = { ...valores(r, t, nombreEjercicio), tal_cual: r.talCual ? `${r.talCual} · ${ESCALA[r.talCual as 1 | 2 | 3 | 4 | 5]}` : "" };
  const lineas = ["Feedback de Playbook (beta)", ""];
  for (const [campo, etiqueta] of RENGLONES) if (v[campo]) lineas.push(`${etiqueta}: ${v[campo]}`);
  lineas.push("", `Info técnica: v${t.version} · ${t.dispositivo} · ${t.pwa ? "instalada" : "en el navegador"} · ${cuantos(t.sesiones, "sesión", "sesiones")} · ${cuantos(t.cancha, "vez", "veces")} en modo cancha · ${cuantos(t.propios, "ejercicio propio", "ejercicios propios")}`);
  return lineas.join("\n");
}

/** User agent resumido a "Sistema · Navegador versión" (sin el resto, que identifica más de la cuenta). */
export function resumirUA(ua: string): string {
  const so = /iPhone/.test(ua)
    ? "iPhone"
    : /iPad/.test(ua)
      ? "iPad"
      : /Android/.test(ua)
        ? "Android"
        : /Windows/.test(ua)
          ? "Windows"
          : /Mac OS X|Macintosh/.test(ua)
            ? "Mac"
            : /Linux/.test(ua)
              ? "Linux"
              : "Otro";
  const nav: [RegExp, string][] = [
    [/EdgA?\/(\d+)/, "Edge"],
    [/SamsungBrowser\/(\d+)/, "Samsung Internet"],
    [/OPR\/(\d+)/, "Opera"],
    [/Firefox\/(\d+)|FxiOS\/(\d+)/, "Firefox"],
    [/CriOS\/(\d+)|Chrome\/(\d+)/, "Chrome"],
    [/Version\/(\d+).*Safari/, "Safari"],
  ];
  for (const [re, nombre] of nav) {
    const m = ua.match(re);
    if (m) return `${so} · ${nombre} ${m.slice(1).find(Boolean) ?? ""}`.trim();
  }
  return so;
}

export interface ConfigFeedback {
  form?: { url: string; entries: Entries };
  whatsapp?: string;
}

/** Lee la configuración (variables NEXT_PUBLIC_FEEDBACK_*). Una URL o un JSON mal escritos cuentan como no configurados. */
export function leerConfig(env: { url?: string; entries?: string; whatsapp?: string }): ConfigFeedback {
  const c: ConfigFeedback = {};
  if (env.url && /^https:\/\/.+\/formResponse$/.test(env.url.trim()) && env.entries) {
    try {
      const entries = JSON.parse(env.entries) as Entries;
      if (Object.values(entries).some((e) => typeof e === "string" && /^entry\.\d+$/.test(e))) c.form = { url: env.url.trim(), entries };
    } catch {
      // JSON roto: queda el fallback.
    }
  }
  const numero = env.whatsapp?.replace(/\D/g, "");
  if (numero) c.whatsapp = numero;
  return c;
}
