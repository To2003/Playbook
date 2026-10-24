/**
 * Datos estáticos para las maquetas de la pausa de diseño.
 * Cuando el motor de generación exista (módulo 4), las pantallas leen de él y este archivo se borra.
 */
import type { Elemento, Pizarra, Punto } from "@/lib/pizarra/types";

const jug = (id: string, equipo: "A" | "B" | "comodin", etiqueta?: string): Elemento => ({ id, tipo: "jugador", equipo, etiqueta });
const cono = (id: string): Elemento => ({ id, tipo: "cono" });
const bocha = (id: string): Elemento => ({ id, tipo: "bocha" });

/** Activación con cambios de ritmo: dos filas, de cono a cono, frenando en la línea de 23. */
const activacion: Pizarra = (() => {
  const ys = [9, 15, 21, 27.5, 34, 40, 46];
  const elementos: Elemento[] = [
    ...ys.map((_, i) => jug(`a${i}`, "A", String(i + 1))),
    ...ys.map((_, i) => cono(`c${i}`)),
    ...ys.map((_, i) => cono(`d${i}`)),
  ];
  const inicio: Record<string, Punto> = {};
  const fin: Record<string, Punto> = {};
  ys.forEach((y, i) => {
    inicio[`a${i}`] = { x: 50, y };
    fin[`a${i}`] = { x: 84, y };
    inicio[`c${i}`] = fin[`c${i}`] = { x: 50, y: y + 2.4 };
    inicio[`d${i}`] = fin[`d${i}`] = { x: 86.5, y: y + 2.4 };
  });
  return {
    vista: "media",
    elementos,
    pasos: [
      {
        duracion: 2.4,
        posiciones: inicio,
        trazos: [0, 2, 4, 6].map((i) => ({
          id: `t${i}`,
          tipo: "desplazamiento" as const,
          desde: `a${i}`,
          puntos: [{ x: 50, y: ys[i] }, { x: 84, y: ys[i] }],
        })),
      },
      { duracion: 1, posiciones: fin, trazos: [] },
    ],
  };
})();

/** Conducción en el cuadrado, con derecho y revés: cada uno con su bocha, girando sin chocarse. */
const conduccion: Pizarra = (() => {
  const centro = { x: 68, y: 27.5 };
  const enRonda = (grados: number, radio: number): Punto => ({
    x: centro.x + Math.cos((grados * Math.PI) / 180) * radio,
    y: centro.y + Math.sin((grados * Math.PI) / 180) * radio,
  });
  const angulos = [0, 60, 120, 180, 240, 300];
  const salida = angulos.map((g) => enRonda(g, 7.5));
  const llegada = angulos.map((g) => enRonda(g + 55, 7.5));
  const elementos: Elemento[] = [
    { id: "z", tipo: "zona", forma: "rect", ancho: 22, alto: 22 },
    ...["c1", "c2", "c3", "c4"].map(cono),
    ...salida.map((_, i) => jug(`a${i}`, "A", String(i + 1))),
    ...salida.map((_, i) => bocha(`b${i}`)),
  ];
  const pos = (lista: Punto[], giro: number): Record<string, Punto> => {
    const r: Record<string, Punto> = { z: centro, c1: { x: 57, y: 16.5 }, c2: { x: 79, y: 16.5 }, c3: { x: 79, y: 38.5 }, c4: { x: 57, y: 38.5 } };
    lista.forEach((p, i) => {
      r[`a${i}`] = p;
      // La bocha va adelante, en el sentido del giro.
      const g = ((angulos[i] + giro + 22) * Math.PI) / 180;
      r[`b${i}`] = { x: centro.x + Math.cos(g) * 7.6, y: centro.y + Math.sin(g) * 7.6 };
    });
    return r;
  };
  return {
    vista: "media",
    elementos,
    pasos: [
      {
        duracion: 3,
        posiciones: pos(salida, 0),
        trazos: salida.map((a, i) => ({
          id: `t${i}`,
          tipo: "conduccion" as const,
          desde: `a${i}`,
          puntos: [a, enRonda(angulos[i] + 27, 9.5), llegada[i]],
        })),
      },
      { duracion: 1, posiciones: pos(llegada, 55), trazos: [] },
    ],
  };
})();

/** Push y recepción orientada en triángulo: recibe perfilado y sale conduciendo hacia el espacio. */
export const triangulos: Pizarra = {
  vista: "media",
  elementos: [
    jug("a1", "A", "1"), jug("a2", "A", "2"), jug("a3", "A", "3"),
    jug("e1", "A", "4"), jug("e2", "A", "5"), jug("e3", "A", "6"),
    cono("c1"), cono("c2"), cono("c3"), cono("c4"), cono("c5"), cono("c6"),
    bocha("b"), bocha("bb"),
  ],
  pasos: [
    {
      duracion: 1.2,
      posiciones: {
        a1: { x: 56, y: 22 }, a2: { x: 72, y: 13 }, a3: { x: 74, y: 30 },
        e1: { x: 58, y: 40 }, e2: { x: 72, y: 36 }, e3: { x: 80, y: 47 },
        c1: { x: 54, y: 24 }, c2: { x: 72, y: 10 }, c3: { x: 76, y: 32 },
        c4: { x: 56, y: 42 }, c5: { x: 70, y: 38.5 }, c6: { x: 82, y: 49 },
        b: { x: 57.6, y: 22.6 }, bb: { x: 59.6, y: 40.6 },
      },
      trazos: [
        { id: "p1", tipo: "pase", desde: "a1", hacia: "a2", puntos: [{ x: 56, y: 22 }, { x: 72, y: 13 }] },
        { id: "q1", tipo: "pase", desde: "e1", hacia: "e2", puntos: [{ x: 58, y: 40 }, { x: 72, y: 36 }] },
      ],
    },
    {
      duracion: 1.4,
      posiciones: {
        a1: { x: 56, y: 22 }, a2: { x: 72, y: 13 }, a3: { x: 74, y: 30 },
        e1: { x: 58, y: 40 }, e2: { x: 72, y: 36 }, e3: { x: 80, y: 47 },
        c1: { x: 54, y: 24 }, c2: { x: 72, y: 10 }, c3: { x: 76, y: 32 },
        c4: { x: 56, y: 42 }, c5: { x: 70, y: 38.5 }, c6: { x: 82, y: 49 },
        b: { x: 72, y: 14.6 }, bb: { x: 72, y: 37.6 },
      },
      trazos: [
        { id: "c", tipo: "conduccion", desde: "a2", puntos: [{ x: 72, y: 13 }, { x: 79, y: 15 }, { x: 83, y: 20 }] },
      ],
    },
    {
      duracion: 1.2,
      posiciones: {
        a1: { x: 56, y: 22 }, a2: { x: 83, y: 20 }, a3: { x: 74, y: 30 },
        e1: { x: 58, y: 40 }, e2: { x: 72, y: 36 }, e3: { x: 80, y: 47 },
        c1: { x: 54, y: 24 }, c2: { x: 72, y: 10 }, c3: { x: 76, y: 32 },
        c4: { x: 56, y: 42 }, c5: { x: 70, y: 38.5 }, c6: { x: 82, y: 49 },
        b: { x: 84.4, y: 21.4 }, bb: { x: 72, y: 37.6 },
      },
      trazos: [
        { id: "p2", tipo: "pase", desde: "a2", hacia: "a3", puntos: [{ x: 83, y: 20 }, { x: 74, y: 30 }] },
        { id: "q2", tipo: "pase", desde: "e2", hacia: "e3", puntos: [{ x: 72, y: 36 }, { x: 80, y: 47 }] },
      ],
    },
    {
      duracion: 1,
      posiciones: {
        a1: { x: 56, y: 22 }, a2: { x: 83, y: 20 }, a3: { x: 74, y: 30 },
        e1: { x: 58, y: 40 }, e2: { x: 72, y: 36 }, e3: { x: 80, y: 47 },
        c1: { x: 54, y: 24 }, c2: { x: 72, y: 10 }, c3: { x: 76, y: 32 },
        c4: { x: 56, y: 42 }, c5: { x: 70, y: 38.5 }, c6: { x: 82, y: 49 },
        b: { x: 75.4, y: 31.2 }, bb: { x: 81.4, y: 48.2 },
      },
      trazos: [],
    },
  ],
};

/** Juego reducido 7 contra 7 con salida por los costados: el gol vale si la salida pasó por un lateral. */
export const reducido: Pizarra = (() => {
  const A: Punto[] = [{ x: 12, y: 14 }, { x: 14, y: 41 }, { x: 30, y: 8 }, { x: 33, y: 27.5 }, { x: 31, y: 47 }, { x: 52, y: 20 }, { x: 55, y: 38 }];
  const B: Punto[] = [{ x: 22, y: 24 }, { x: 24, y: 36 }, { x: 41, y: 14 }, { x: 44, y: 30 }, { x: 42, y: 44 }, { x: 64, y: 22 }, { x: 66, y: 36 }];
  const elementos: Elemento[] = [
    { id: "k1", tipo: "arquero", etiqueta: "A" },
    { id: "k2", tipo: "arquero", etiqueta: "B" },
    ...A.map((_, i) => jug(`a${i}`, "A", String(i + 1))),
    ...B.map((_, i) => jug(`b${i}`, "B", String(i + 1))),
    bocha("bo"),
  ];
  const base: Record<string, Punto> = { k1: { x: 2.2, y: 27.5 }, k2: { x: 89.2, y: 27.5 } };
  A.forEach((p, i) => (base[`a${i}`] = p));
  B.forEach((p, i) => (base[`b${i}`] = p));
  return {
    vista: "completa",
    elementos,
    pasos: [
      { duracion: 1.2, posiciones: { ...base, bo: { x: 13.6, y: 15 } }, trazos: [{ id: "p1", tipo: "pase", desde: "a0", hacia: "a2", puntos: [A[0], A[2]] }] },
      {
        duracion: 1.6,
        posiciones: { ...base, bo: { x: 31.6, y: 9 } },
        trazos: [{ id: "c1", tipo: "conduccion", desde: "a2", puntos: [A[2], { x: 42, y: 5.5 }, { x: 55, y: 7 }] }],
      },
      {
        duracion: 1.2,
        posiciones: { ...base, a2: { x: 55, y: 7 }, bo: { x: 56.6, y: 8 } },
        trazos: [{ id: "p2", tipo: "pase", desde: "a2", hacia: "a5", puntos: [{ x: 55, y: 7 }, { x: 71, y: 17 }] }],
      },
      {
        duracion: 1,
        posiciones: { ...base, a2: { x: 55, y: 7 }, a5: { x: 71, y: 17 }, bo: { x: 72.4, y: 18 } },
        trazos: [{ id: "t1", tipo: "tiro", desde: "a5", puntos: [{ x: 71, y: 17 }, { x: 91.4, y: 26.4 }] }],
      },
      { duracion: 1, posiciones: { ...base, a2: { x: 55, y: 7 }, a5: { x: 71, y: 17 }, bo: { x: 91.6, y: 26.6 } }, trazos: [] },
    ],
  };
})();

/** 1 contra 1 en carriles: el que ataca conduce, el que marca acompaña de perfil y espera el quite. */
const carriles: Pizarra = (() => {
  const ys = [12, 27.5, 43];
  const elementos: Elemento[] = [
    ...ys.map((_, i): Elemento => ({ id: `z${i}`, tipo: "zona", forma: "rect", ancho: 34, alto: 11 })),
    ...ys.map((_, i) => jug(`a${i}`, "A", String(i + 1))),
    ...ys.map((_, i) => jug(`b${i}`, "B", String(i + 1))),
    ...ys.map((_, i) => bocha(`o${i}`)),
    ...ys.map((_, i): Elemento => ({ id: `g${i}`, tipo: "arco_chico", rotacion: 90 })),
  ];
  const pos = (ax: number, bx: number): Record<string, Punto> => {
    const r: Record<string, Punto> = {};
    ys.forEach((y, i) => {
      r[`z${i}`] = { x: 69, y };
      r[`a${i}`] = { x: ax, y: y + (i === 1 ? 2 : -1.5) };
      r[`b${i}`] = { x: bx, y: y + (i === 1 ? -1 : 1.5) };
      r[`o${i}`] = { x: ax + 1.6, y: y + (i === 1 ? 2.8 : -0.7) };
      r[`g${i}`] = { x: 86.5, y };
    });
    return r;
  };
  return {
    vista: "media",
    elementos,
    pasos: [
      {
        duracion: 2.6,
        posiciones: pos(54, 70),
        trazos: ys.flatMap((y, i) => [
          { id: `c${i}`, tipo: "conduccion" as const, desde: `a${i}`, puntos: [{ x: 54, y: y + (i === 1 ? 2 : -1.5) }, { x: 64, y: y + (i === 1 ? -2 : 2) }, { x: 74, y: y + (i === 1 ? 2 : -1.5) }] },
          { id: `d${i}`, tipo: "desplazamiento" as const, desde: `b${i}`, puntos: [{ x: 70, y: y + (i === 1 ? -1 : 1.5) }, { x: 78, y: y + (i === 1 ? 0.5 : -0.5) }] },
        ]),
      },
      { duracion: 1, posiciones: pos(74, 78), trazos: [] },
    ],
  };
})();

/** Elongación en ronda: todos mirando al centro, sin apuro. */
const ronda: Pizarra = (() => {
  const n = 14;
  const elementos: Elemento[] = Array.from({ length: n }, (_, i) => jug(`a${i}`, "A", String(i + 1)));
  const posiciones: Record<string, Punto> = {};
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2;
    posiciones[`a${i}`] = { x: 68 + Math.cos(ang) * 15, y: 27.5 + Math.sin(ang) * 15 };
  }
  return { vista: "media", elementos, pasos: [{ duracion: 1, posiciones, trazos: [] }] };
})();

export type Fase = "calor_sin_bocha" | "calor_con_bocha" | "principal" | "aplicado" | "vuelta_calma";

export const NOMBRE_FASE: Record<Fase, string> = {
  calor_sin_bocha: "Entrada en calor sin bocha",
  calor_con_bocha: "Entrada en calor con bocha",
  principal: "Principal técnico/táctico",
  aplicado: "Juego aplicado",
  vuelta_calma: "Vuelta a la calma",
};

export interface BloqueMaqueta {
  id: string;
  fase: Fase;
  minutos: number;
  ejercicio: string;
  division: string;
  arqueros?: string;
  pizarra: Pizarra;
  puntosClave: string[];
}

export interface PausaMaqueta {
  id: string;
  pausa: true;
  minutos: number;
}

export const sesionMaqueta: { jugadores: number; arqueros: number; nivel: string; intensidad: string; items: (BloqueMaqueta | PausaMaqueta)[] } = {
  jugadores: 14,
  arqueros: 2,
  nivel: "Intermedio",
  intensidad: "Media",
  items: [
    {
      id: "b1",
      fase: "calor_sin_bocha",
      minutos: 10,
      ejercicio: "Activación con cambios de ritmo",
      division: "14 → 2 filas de 7",
      arqueros: "Arqueros: desplazamientos laterales entre platos",
      pizarra: activacion,
      puntosClave: ["Frená en la línea de 23 y arrancá de nuevo", "Brazos activos, pasos cortos", "Mirada arriba"],
    },
    {
      id: "b2",
      fase: "calor_con_bocha",
      minutos: 13,
      ejercicio: "Conducción en el cuadrado con derecho y revés",
      division: "14 → todos con bocha, cuadrado de 22 × 22 m",
      arqueros: "Arqueros: reacción a pases rasantes desde 8 m",
      pizarra: conduccion,
      puntosClave: ["Bocha adelante y a la derecha del cuerpo", "Cambiá a revés antes de chocar", "Levantá la vista cada tres toques"],
    },
    { id: "h1", pausa: true, minutos: 2 },
    {
      id: "b3",
      fase: "principal",
      minutos: 15,
      ejercicio: "Push y recepción orientada en triángulos",
      division: "14 → 2 grupos de 4 y 2 de 3",
      arqueros: "Arqueros: despejes con el pie desde el borde del área",
      pizarra: triangulos,
      puntosClave: ["Recibí perfilado hacia donde vas a salir", "Push con el peso en la pierna de adelante", "Pedila con el palo en el piso"],
    },
    {
      id: "b4",
      fase: "principal",
      minutos: 15,
      ejercicio: "Quite y marca en carriles, 1 contra 1",
      division: "14 → 7 parejas",
      arqueros: "Arqueros: achique y bloqueo en el 1 contra 1",
      pizarra: carriles,
      puntosClave: ["Defendé de perfil, nunca de frente", "Esperá el error, no te tires", "Palo abajo, del lado del revés"],
    },
    { id: "h2", pausa: true, minutos: 2 },
    {
      id: "b5",
      fase: "aplicado",
      minutos: 26,
      ejercicio: "Reducido 7 contra 7 con salida por los costados",
      division: "14 → 7 contra 7, un arquero por equipo",
      pizarra: reducido,
      puntosClave: ["La salida tiene que pasar por un lateral", "Abrí la cancha bien ancha", "Después de perderla, presión de 5 segundos"],
    },
    {
      id: "b6",
      fase: "vuelta_calma",
      minutos: 7,
      ejercicio: "Elongación en ronda y cierre",
      division: "14 + 2 arqueros, todos juntos",
      pizarra: ronda,
      puntosClave: ["Respirá largo en cada posición", "Nada de rebotes al elongar", "Si algo duele, avisale al cuerpo médico"],
    },
  ],
};

/** Ubicaciones de las fichas del contador "¿Cuántos vinieron?", en el orden en que se suman. */
export function lugaresContador(): Punto[] {
  const filas = [79, 72.5, 66, 59.5, 53, 47.5];
  const cols = [7, 17, 27.5, 38, 48];
  const lugares: Punto[] = [];
  // Orden salteado para que la cancha se llene pareja y no fila por fila.
  const orden = [12, 7, 17, 2, 22, 11, 13, 6, 18, 8, 16, 1, 23, 3, 21, 10, 14, 5, 19, 0, 24, 9, 15, 4, 20, 27, 26, 28, 25, 29];
  for (const k of orden) {
    const f = Math.floor(k / 5);
    const c = k % 5;
    const jitterX = ((k * 37) % 7) / 7 - 0.5;
    const jitterY = ((k * 53) % 9) / 9 - 0.5;
    lugares.push({ x: filas[f] + jitterX * 2.4, y: cols[c] + jitterY * 3 + (f % 2 ? 2.5 : -2.5) });
  }
  return lugares;
}
