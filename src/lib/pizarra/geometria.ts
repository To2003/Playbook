import type { Punto, Vista } from "./types";

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

export type Orientacion = "horizontal" | "vertical";

export interface Encuadre {
  /** Rectángulo de cancha que se ve, en metros (sin proyectar). */
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

const MARGEN = 2;

export const ENCUADRES: Record<Vista, Encuadre> = {
  completa: { x0: -MARGEN, x1: CANCHA.largo + MARGEN, y0: -MARGEN, y1: CANCHA.ancho + MARGEN },
  media: { x0: CANCHA.largo / 2 - MARGEN, x1: CANCHA.largo + MARGEN, y0: -MARGEN, y1: CANCHA.ancho + MARGEN },
  area: { x0: CANCHA.largo - 26, x1: CANCHA.largo + MARGEN, y0: 3, y1: CANCHA.ancho - 3 },
};

/** Tamaño de ficha según la vista, para que se lea igual en cualquier encuadre. */
export const RADIO_FICHA: Record<Vista, number> = { completa: 1.7, media: 1.35, area: 0.95 };

/**
 * Proyección de metros de cancha a coordenadas del SVG.
 * En vertical, el arco derecho queda arriba: así la media cancha entra en un celu parado.
 */
export function proyector(orientacion: Orientacion) {
  if (orientacion === "horizontal") return (p: Punto): Punto => p;
  return (p: Punto): Punto => ({ x: p.y, y: CANCHA.largo - p.x });
}

export function viewBox(vista: Vista, orientacion: Orientacion): { x: number; y: number; w: number; h: number } {
  const e = ENCUADRES[vista];
  if (orientacion === "horizontal") return { x: e.x0, y: e.y0, w: e.x1 - e.x0, h: e.y1 - e.y0 };
  return { x: e.y0, y: CANCHA.largo - e.x1, w: e.y1 - e.y0, h: e.x1 - e.x0 };
}

/**
 * Encuadre ajustado: la caja que contiene la jugada (ya proyectada), con aire,
 * estirada a la proporción pedida. Las miniaturas hacen zoom a donde pasa el ejercicio.
 */
export function encuadreAjustado(puntos: Punto[], aire: number, aspecto: number, minimo: number) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const q of puntos) {
    x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y);
    x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y);
  }
  let w = Math.max(x1 - x0 + aire * 2, minimo);
  let h = Math.max(y1 - y0 + aire * 2, minimo / aspecto);
  if (w / h < aspecto) w = h * aspecto;
  else h = w / aspecto;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

const r = (n: number) => Math.round(n * 100) / 100;

export function ruta(puntos: Punto[]): string {
  return puntos.map((p, i) => `${i === 0 ? "M" : "L"}${r(p.x)} ${r(p.y)}`).join("");
}

/** Curva suave (Catmull-Rom) muestreada como polilínea densa. */
export function curva(puntos: Punto[], porTramo = 12): Punto[] {
  if (puntos.length < 3) return puntos.slice();
  const out: Punto[] = [];
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[Math.max(0, i - 1)];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[Math.min(puntos.length - 1, i + 2)];
    for (let s = 0; s < porTramo; s++) {
      const t = s / porTramo;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out.push(puntos[puntos.length - 1]);
  return out;
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

/** Línea ondulada de conducción: la curva con una senoide perpendicular. */
export function ondulada(puntos: Punto[], amplitud: number, onda: number): Punto[] {
  const base = curva(puntos, 24);
  const total = longitud(base);
  if (total === 0) return base;
  const paso = onda / 10;
  const out: Punto[] = [];
  let acumulado = 0;
  let i = 1;
  for (let d = 0; d <= total; d += paso) {
    while (i < base.length - 1 && acumulado + seg(base, i) < d) {
      acumulado += seg(base, i);
      i++;
    }
    const a = base[i - 1];
    const b = base[i];
    const l = seg(base, i) || 1;
    const t = (d - acumulado) / l;
    const nx = -(b.y - a.y) / l;
    const ny = (b.x - a.x) / l;
    // La onda se apaga al final para que la flecha salga derecha.
    const env = Math.min(1, (total - d) / (onda * 0.75));
    const o = Math.sin((d / onda) * Math.PI * 2) * amplitud * env;
    out.push({ x: a.x + (b.x - a.x) * t + nx * o, y: a.y + (b.y - a.y) * t + ny * o });
  }
  out.push(base[base.length - 1]);
  return out;
}

function seg(p: Punto[], i: number) {
  return Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
}

/** Punta de flecha cerrada en el extremo de la polilínea. */
export function puntaFlecha(puntos: Punto[], tam: number): string {
  const n = puntos.length;
  if (n < 2) return "";
  const b = puntos[n - 1];
  // Dirección tomada a un tramo razonable para no depender de micro-segmentos.
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
