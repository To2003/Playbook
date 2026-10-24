import type { Fase, Intensidad, TipoSesion } from "../tipos";

export type FaseBloque = Exclude<Fase, "arquero">;
export type NumBloque = 1 | 2 | 3 | 4 | 5;

export type Hueco = { bloque: NumBloque; fase: FaseBloque; minutos: number } | { pausa: true; minutos: number };

export const FASE_DE: Record<NumBloque, FaseBloque> = {
  1: "calor_sin_bocha",
  2: "calor_con_bocha",
  3: "principal",
  4: "aplicado",
  5: "vuelta_calma",
};

export const PAUSA = 2;

/**
 * Sesión completa con hidratación (prompt de la corrida, sección 1): las dos pausas de 2 min
 * salen de B2 y B4 y el principal queda entero. B3 lleva dos ejercicios en 90 y 120.
 */
const TABLA_COMPLETA: Record<number, { b: [number, number, number[], number, number] }> = {
  60: { b: [8, 10, [20], 13, 5] },
  75: { b: [10, 10, [25], 20, 6] },
  90: { b: [10, 13, [15, 15], 26, 7] },
  120: { b: [12, 16, [22, 23], 33, 10] },
};

/** Reparte `total` en partes proporcionales a `pesos`, redondeando sin perder minutos (mayor resto). */
export function proporcional(total: number, pesos: number[]): number[] {
  const suma = pesos.reduce((s, x) => s + x, 0);
  const exactos = pesos.map((w) => (total * w) / suma);
  const base = exactos.map(Math.floor);
  let falta = total - base.reduce((s, x) => s + x, 0);
  const orden = exactos.map((x, i) => [x - Math.floor(x), i] as const).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (const [, i] of orden) {
    if (falta <= 0) break;
    base[i]++;
    falta--;
  }
  return base;
}

/** Un principal de 30 minutos o más se arma con dos ejercicios. */
const partirPrincipal = (min: number) => (min >= 30 ? proporcional(min, [1, 1]) : [min]);

export function planDeTiempos(tipo: TipoSesion, duracion: number, intensidad: Intensidad): Hueco[] {
  if (tipo === "calor") {
    const [b1, b2] = proporcional(duracion, [10, 13]);
    return [
      { bloque: 1, fase: FASE_DE[1], minutos: b1 },
      { bloque: 2, fase: FASE_DE[2], minutos: b2 },
    ];
  }

  if (tipo === "principal") {
    let [b3, b4] = proporcional(duracion, [30, 26]);
    if (intensidad === 1) {
      // Suave: el aplicado dura 20% menos; sin vuelta a la calma, ese tiempo vuelve al principal.
      const corte = Math.round(b4 * 0.2);
      b4 -= corte;
      b3 += corte;
    }
    return [...partirPrincipal(b3).map((m) => ({ bloque: 3 as const, fase: FASE_DE[3], minutos: m })), { bloque: 4, fase: FASE_DE[4], minutos: b4 }];
  }

  // Sesión completa
  let b1: number, b2: number, b3: number[], b4: number, b5: number;
  const fila = TABLA_COMPLETA[duracion];
  if (fila) [b1, b2, b3, b4, b5] = fila.b.map((x) => (Array.isArray(x) ? x.slice() : x)) as [number, number, number[], number, number];
  else {
    // Duración libre: proporcional a la fila de 90, con las pausas fijas.
    const [x1, x2, x3, x4, x5] = proporcional(duracion - 2 * PAUSA, [10, 13, 30, 26, 7]);
    [b1, b2, b3, b4, b5] = [x1, x2, partirPrincipal(x3), x4, x5];
  }
  if (intensidad === 1) {
    const corte = Math.round(b4 * 0.2);
    b4 -= corte;
    b5 += corte;
  }
  if (intensidad === 3 && b1 + b2 < 15) {
    // Fuerte: la entrada en calor nunca baja de 15 minutos; se toma del principal.
    const falta = 15 - (b1 + b2);
    b2 += falta;
    const total3 = b3.reduce((s, x) => s + x, 0) - falta;
    b3 = partirPrincipal(total3);
  }
  return [
    { bloque: 1, fase: FASE_DE[1], minutos: b1 },
    { bloque: 2, fase: FASE_DE[2], minutos: b2 },
    { pausa: true, minutos: PAUSA },
    ...b3.map((m) => ({ bloque: 3 as const, fase: FASE_DE[3], minutos: m })),
    { pausa: true, minutos: PAUSA },
    { bloque: 4, fase: FASE_DE[4], minutos: b4 },
    { bloque: 5, fase: FASE_DE[5], minutos: b5 },
  ];
}
