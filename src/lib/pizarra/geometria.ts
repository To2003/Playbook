import type { Paso, Pizarra, Punto, Trazo } from "../tipos";

/** Cancha de hockey 11, reglamento FIH. Todo en metros. */
export const CANCHA = {
  largo: 91.4,
  ancho: 55,
  linea23: 22.9,
  radioArea: 14.63,
  radioPunteada: 19.63,
  penal: 6.4,
  arco: 3.66,
  profundidadArco: 1.2,
  /** Marcas de córner corto sobre la línea de fondo, medidas desde el poste. */
  marcasCorner: [5, 10],
} as const;

export type Vista = Pizarra["vista"];
export type Orientacion = "horizontal" | "vertical";
export type Caja = { x: number; y: number; w: number; h: number };

const MARGEN = 2;

/** Encuadre de cada vista, en metros de cancha (sin rotar). */
export const VISTAS: Record<Vista, Caja> = {
  completa: { x: -MARGEN, y: -MARGEN, w: CANCHA.largo + MARGEN * 2, h: CANCHA.ancho + MARGEN * 2 },
  media: { x: CANCHA.largo / 2 - MARGEN, y: -MARGEN, w: CANCHA.largo / 2 + MARGEN * 2, h: CANCHA.ancho + MARGEN * 2 },
  area: { x: CANCHA.largo - 26, y: 3, w: 26 + MARGEN, h: CANCHA.ancho - 6 },
};

/** Tamaño de ficha según la vista, para que se lea igual en cualquier encuadre. */
export const RADIO_FICHA: Record<Vista, number> = { completa: 1.7, media: 1.35, area: 0.95 };

/** La cancha completa va acostada; media y área van paradas, con el arco arriba. */
export const orientacionDe = (vista: Vista): Orientacion => (vista === "completa" ? "horizontal" : "vertical");

/**
 * Rotación del grupo para la vista parada: el arco derecho (x = 91,4) queda arriba.
 * x' = y ; y' = 91,4 − x
 */
export const ROTACION_VERTICAL = `matrix(0 -1 1 0 0 ${CANCHA.largo})`;

export function rotar(p: Punto, orientacion: Orientacion): Punto {
  return orientacion === "horizontal" ? p : { x: p.y, y: CANCHA.largo - p.x };
}

/** Pasa una caja en metros de cancha a coordenadas de pantalla del SVG. */
export function cajaEnPantalla(c: Caja, orientacion: Orientacion): Caja {
  if (orientacion === "horizontal") return c;
  return { x: c.y, y: CANCHA.largo - (c.x + c.w), w: c.h, h: c.w };
}

const r = (n: number) => Math.round(n * 100) / 100;

export function ruta(puntos: Punto[]): string {
  return puntos.map((p, i) => `${i === 0 ? "M" : "L"}${r(p.x)} ${r(p.y)}`).join("");
}

/** Recorrido de un trazo como polilínea densa: recta o curva cuadrática. */
export function muestrear(t: Pick<Trazo, "desde" | "hasta" | "control">, n = 24): Punto[] {
  if (!t.control) return [t.desde, t.hasta];
  const { desde: a, control: c, hasta: b } = t;
  const out: Punto[] = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    const u = 1 - s;
    out.push({ x: u * u * a.x + 2 * u * s * c.x + s * s * b.x, y: u * u * a.y + 2 * u * s * c.y + s * s * b.y });
  }
  return out;
}

/** Path SVG exacto del recorrido (sin ondas): lo usa MotionPath para que la bocha y el jugador lo sigan. */
export function pathRecorrido(t: Pick<Trazo, "desde" | "hasta" | "control">): string {
  const { desde: a, hasta: b, control: c } = t;
  return c ? `M${r(a.x)} ${r(a.y)}Q${r(c.x)} ${r(c.y)} ${r(b.x)} ${r(b.y)}` : `M${r(a.x)} ${r(a.y)}L${r(b.x)} ${r(b.y)}`;
}

export function longitud(puntos: Punto[]): number {
  let total = 0;
  for (let i = 1; i < puntos.length; i++) total += Math.hypot(puntos[i].x - puntos[i - 1].x, puntos[i].y - puntos[i - 1].y);
  return total;
}

/** Recorta la polilínea para que termine `metros` antes del final (la flecha no pisa la ficha). */
export function recortarFinal(puntos: Punto[], metros: number): Punto[] {
  if (metros <= 0 || puntos.length < 2) return puntos;
  const out = puntos.slice();
  let restante = metros;
  while (out.length >= 2) {
    const a = out[out.length - 2];
    const b = out[out.length - 1];
    const tramo = Math.hypot(b.x - a.x, b.y - a.y);
    if (tramo > restante) {
      const k = (tramo - restante) / tramo;
      out[out.length - 1] = { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
      return out;
    }
    restante -= tramo;
    out.pop();
  }
  return out;
}

export function recortarInicio(puntos: Punto[], metros: number): Punto[] {
  return recortarFinal(puntos.slice().reverse(), metros).reverse();
}

/** Línea ondulada de conducción: la polilínea con una senoide perpendicular que se apaga al final. */
export function ondulada(base: Punto[], amplitud: number, onda: number): Punto[] {
  const total = longitud(base);
  if (total === 0) return base;
  const paso = onda / 10;
  const out: Punto[] = [];
  let acumulado = 0;
  let i = 1;
  const seg = (k: number) => Math.hypot(base[k].x - base[k - 1].x, base[k].y - base[k - 1].y);
  for (let d = 0; d <= total; d += paso) {
    while (i < base.length - 1 && acumulado + seg(i) < d) {
      acumulado += seg(i);
      i++;
    }
    const a = base[i - 1];
    const b = base[i];
    const l = seg(i) || 1;
    const t = (d - acumulado) / l;
    const nx = -(b.y - a.y) / l;
    const ny = (b.x - a.x) / l;
    const env = Math.min(1, (total - d) / (onda * 0.75));
    const o = Math.sin((d / onda) * Math.PI * 2) * amplitud * env;
    out.push({ x: a.x + (b.x - a.x) * t + nx * o, y: a.y + (b.y - a.y) * t + ny * o });
  }
  out.push(base[base.length - 1]);
  return out;
}

/** Punta de flecha cerrada en el extremo de la polilínea. */
export function puntaFlecha(puntos: Punto[], tam: number): string {
  const n = puntos.length;
  if (n < 2) return "";
  const b = puntos[n - 1];
  let a = puntos[n - 2];
  for (let i = n - 2; i >= 0; i--) {
    a = puntos[i];
    if (Math.hypot(b.x - a.x, b.y - a.y) > tam) break;
  }
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  const izq = { x: b.x - tam * Math.cos(ang - 0.42), y: b.y - tam * Math.sin(ang - 0.42) };
  const der = { x: b.x - tam * Math.cos(ang + 0.42), y: b.y - tam * Math.sin(ang + 0.42) };
  return `M${r(b.x)} ${r(b.y)}L${r(izq.x)} ${r(izq.y)}L${r(der.x)} ${r(der.y)}Z`;
}

/** Geometría dibujable de un trazo, en metros de cancha: la línea y su punta. */
export function dibujoTrazo(t: Trazo, rad: number) {
  const base = muestrear(t);
  const linea = t.tipo === "conduccion" ? ondulada(muestrear(t, 48), rad * 0.26, rad * 2.2) : base;
  // Arranca afuera de la ficha y termina antes de la que recibe.
  const sinInicio = recortarInicio(linea, t.tipo === "pase" || t.tipo === "tiro" ? rad * 0.5 : rad * 0.9);
  const recorrido = recortarFinal(sinInicio, rad * (t.tipo === "pase" || t.tipo === "tiro" ? 1.2 : 1.35));
  const tam = rad * (t.tipo === "tiro" ? 1.05 : 0.85);
  return { d: ruta(recorrido), punta: puntaFlecha(recorrido, tam), largo: longitud(recorrido) };
}

/**
 * En una conducción la bocha viaja pegada al palo: es la bocha más cercana al jugador
 * al empezar el paso (a menos de 3,5 m).
 */
export function bochaQueAcompana(paso: Paso, trazo: Trazo, bochas: string[]): string | null {
  if (trazo.tipo !== "conduccion") return null;
  let mejor: string | null = null;
  let dist = 3.5;
  for (const id of bochas) {
    const p = paso.posiciones[id];
    if (!p) continue;
    const d = Math.hypot(p.x - trazo.desde.x, p.y - trazo.desde.y);
    if (d < dist) {
      dist = d;
      mejor = id;
    }
  }
  return mejor;
}

/**
 * Encuadre ajustado: la caja (en metros de cancha) que contiene la jugada, con aire,
 * estirada a la proporción pedida en pantalla.
 */
export function encuadreAjustado(pizarra: Pizarra, aspectoPantalla: number, aire: number, minimo = 26): Caja {
  const orientacion = orientacionDe(pizarra.vista);
  // Proporción en metros de cancha: en vertical se invierte.
  const aspecto = orientacion === "vertical" ? 1 / aspectoPantalla : aspectoPantalla;
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  const tomar = (q: Punto) => {
    x0 = Math.min(x0, q.x);
    y0 = Math.min(y0, q.y);
    x1 = Math.max(x1, q.x);
    y1 = Math.max(y1, q.y);
  };
  const tam = new Map(pizarra.elementos.map((e) => [e.id, e.tam]));
  for (const paso of pizarra.pasos) {
    for (const [id, q] of Object.entries(paso.posiciones)) {
      const t = tam.get(id);
      if (t) {
        tomar({ x: q.x - t.w / 2, y: q.y - t.h / 2 });
        tomar({ x: q.x + t.w / 2, y: q.y + t.h / 2 });
      } else tomar(q);
    }
    for (const t of paso.trazos) muestrear(t, 8).forEach(tomar);
  }
  if (!Number.isFinite(x0)) return VISTAS[pizarra.vista];
  let w = Math.max(x1 - x0 + aire * 2, orientacion === "vertical" ? minimo / aspectoPantalla : minimo);
  let h = Math.max(y1 - y0 + aire * 2, w / aspecto / 2);
  if (w / h < aspecto) w = h * aspecto;
  else h = w / aspecto;
  return { x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h };
}
