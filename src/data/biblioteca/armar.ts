/**
 * Helpers para escribir la biblioteca base sin repetir coordenadas a mano.
 * Una pizarra se escribe como posiciones iniciales + una lista de movimientos por paso;
 * las posiciones de cada paso se calculan aplicando los movimientos del anterior.
 */
import { bochaQueAcompana } from "@/lib/pizarra/geometria";
import type { Ejercicio, Elemento, Pizarra, Punto, Trazo } from "@/lib/tipos";

// ---------------------------------------------------------------------------
// Elementos

export const A = (n: number | string): Elemento => ({ id: `a${n}`, tipo: "jugador", equipo: "A", etiqueta: String(n) });
export const B = (n: number | string): Elemento => ({ id: `b${n}`, tipo: "jugador", equipo: "B", etiqueta: String(n) });
export const C = (n: number | string = ""): Elemento => ({ id: `c${n}`, tipo: "jugador", equipo: "C", etiqueta: n === "" ? "C" : String(n) });
/** Entrenador o pasador: comodín con la letra E. */
export const E = (id = "e"): Elemento => ({ id, tipo: "jugador", equipo: "C", etiqueta: "E" });
export const K = (id = "k", etiqueta?: string): Elemento => ({ id, tipo: "arquero", etiqueta });
export const bocha = (id: string): Elemento => ({ id, tipo: "bocha" });
export const cono = (id: string): Elemento => ({ id, tipo: "cono" });
export const valla = (id: string): Elemento => ({ id, tipo: "valla" });
export const aro = (id: string): Elemento => ({ id, tipo: "aro" });
export const arcoChico = (id: string): Elemento => ({ id, tipo: "arco_chico" });
export const zona = (id: string, w: number, h: number): Elemento => ({ id, tipo: "zona", tam: { w, h } });

/** Varios elementos iguales con ids numerados: `muchos(cono, "c", 4)` → c1..c4. */
export const muchos = (f: (id: string) => Elemento, prefijo: string, n: number) => Array.from({ length: n }, (_, i) => f(`${prefijo}${i + 1}`));
export const equipo = (f: (n: number) => Elemento, n: number, desde = 1) => Array.from({ length: n }, (_, i) => f(i + desde));

// ---------------------------------------------------------------------------
// Movimientos: solo el destino; el origen se toma de dónde está el elemento.

type Mov = Omit<Trazo, "desde">;
export const corre = (id: string, hasta: Punto, control?: Punto): Mov => ({ tipo: "desplazamiento", elementoId: id, hasta, control });
export const conduce = (id: string, hasta: Punto, control?: Punto): Mov => ({ tipo: "conduccion", elementoId: id, hasta, control });
export const pasa = (bochaId: string, hasta: Punto, control?: Punto): Mov => ({ tipo: "pase", elementoId: bochaId, hasta, control });
export const tira = (bochaId: string, hasta: Punto, control?: Punto): Mov => ({ tipo: "tiro", elementoId: bochaId, hasta, control });

export const p = (x: number, y: number): Punto => ({ x, y });

/** Punto a `d` metros de `q`, un poco adelante (para dejar la bocha pegada al palo). */
export const pegada = (q: Punto, dx = 1.4, dy = 0.8): Punto => ({ x: q.x + dx, y: q.y + dy });

interface PasoMov {
  ms?: number;
  movs: Mov[];
}

/**
 * Arma los pasos: el paso 0 son las posiciones iniciales; cada grupo de movimientos
 * lleva al paso siguiente. N grupos → N + 1 pasos.
 */
export function pizarra(vista: Pizarra["vista"], elementos: Elemento[], inicio: Record<string, Punto>, grupos: PasoMov[]): Pizarra {
  const bochas = elementos.filter((e) => e.tipo === "bocha").map((e) => e.id);
  const pasos: Pizarra["pasos"] = [];
  let pos = { ...inicio };
  for (const g of grupos) {
    const trazos: Trazo[] = g.movs.map((m) => {
      const desde = pos[m.elementoId];
      if (!desde) throw new Error(`Movimiento de un elemento sin posición: ${m.elementoId}`);
      return { ...m, desde };
    });
    const paso = { duracionMs: g.ms ?? 1600, posiciones: pos, trazos };
    pasos.push(paso);
    const siguiente = { ...pos };
    for (const t of trazos) {
      siguiente[t.elementoId] = t.hasta;
      const acompana = bochaQueAcompana(paso, t, bochas);
      if (acompana) {
        const b = pos[acompana];
        siguiente[acompana] = { x: t.hasta.x + (b.x - t.desde.x), y: t.hasta.y + (b.y - t.desde.y) };
      }
    }
    pos = siguiente;
  }
  pasos.push({ duracionMs: 900, posiciones: pos, trazos: [] });
  return { vista, elementos, pasos };
}

// ---------------------------------------------------------------------------
// Ejercicio con valores por defecto del SPEC (5.1).

type Opcionales = "niveles" | "intensidad" | "categorias" | "autor" | "estado" | "actualizado" | "variantes" | "material";
export type DatosEjercicio = Omit<Ejercicio, Opcionales> & Partial<Pick<Ejercicio, Opcionales>>;

export function ejercicio(d: DatosEjercicio): Ejercicio {
  return {
    niveles: ["inicial", "intermedio", "avanzado"],
    intensidad: 2,
    categorias: ["menores", "juveniles", "mayores"],
    variantes: {},
    material: {},
    autor: "base",
    estado: "listo",
    actualizado: 0,
    ...d,
  };
}
