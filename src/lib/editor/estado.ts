import { bochaQueAcompana } from "../pizarra/geometria";
import type { Ejercicio, Elemento, Paso, Pizarra, Punto, Trazo } from "../tipos";

export const MAX_PASOS = 12;
const r = (n: number) => Math.round(n * 10) / 10;
const igual = (a?: Punto, b?: Punto) => !!a && !!b && r(a.x) === r(b.x) && r(a.y) === r(b.y);
const limitar = (q: Punto): Punto => ({ x: r(Math.max(-2, Math.min(93.4, q.x))), y: r(Math.max(-2, Math.min(57, q.y))) });

export type Accion =
  | { tipo: "mover"; paso: number; posiciones: Record<string, Punto> }
  | { tipo: "agregar"; elemento: Elemento; en: Punto }
  | { tipo: "borrar"; ids: string[] }
  | { tipo: "elemento"; id: string; cambios: Pick<Elemento, "etiqueta" | "tam" | "equipo" | "forma"> }
  | { tipo: "duplicar"; ids: string[]; paso: number; nuevosIds: string[] }
  | { tipo: "alinear"; ids: string[]; paso: number; eje: "x" | "y" }
  | { tipo: "trazo"; paso: number; trazo: Trazo }
  | { tipo: "control"; paso: number; indice: number; control?: Punto }
  | { tipo: "borrarTrazo"; paso: number; indice: number }
  | { tipo: "agregarPaso"; despuesDe: number }
  | { tipo: "duplicarPaso"; paso: number }
  | { tipo: "moverPaso"; desde: number; hasta: number }
  | { tipo: "borrarPaso"; paso: number }
  | { tipo: "duracionPaso"; paso: number; ms: number }
  | { tipo: "vista"; vista: Pizarra["vista"] }
  | { tipo: "ficha"; cambios: Partial<Omit<Ejercicio, "pizarra">> };

const conPasos = (e: Ejercicio, pasos: Paso[]): Ejercicio => ({ ...e, pizarra: { ...e.pizarra, pasos } });

/**
 * Los trazos se apoyan en las posiciones: el último paso nunca lleva trazos
 * (no hay paso siguiente) y cada trazo arranca donde está su elemento.
 */
function sanear(pasos: Paso[]): Paso[] {
  return pasos.map((p, i) => {
    if (i === pasos.length - 1) return { ...p, trazos: [] };
    return { ...p, trazos: p.trazos.filter((t) => p.posiciones[t.elementoId]).map((t) => ({ ...t, desde: p.posiciones[t.elementoId] })) };
  });
}

/** Reducer puro del editor: cada acción devuelve un ejercicio nuevo. */
export function aplicar(e: Ejercicio, a: Accion): Ejercicio {
  const pasos = e.pizarra.pasos;
  switch (a.tipo) {
    case "mover": {
      const nuevos = pasos.map((p) => ({ ...p, posiciones: { ...p.posiciones }, trazos: p.trazos.map((t) => ({ ...t })) }));
      for (const [id, destino] of Object.entries(a.posiciones)) {
        const antes = pasos[a.paso]?.posiciones[id];
        const q = limitar(destino);
        nuevos[a.paso].posiciones[id] = q;
        // Los pasos siguientes que no lo habían movido lo siguen.
        for (let k = a.paso + 1; k < nuevos.length; k++) {
          if (igual(pasos[k].posiciones[id], antes)) nuevos[k].posiciones[id] = q;
          else break;
        }
        // Si llegó ahí por un trazo del paso anterior, el trazo termina donde quedó.
        if (a.paso > 0) for (const t of nuevos[a.paso - 1].trazos) if (t.elementoId === id) t.hasta = q;
      }
      return conPasos(e, sanear(nuevos));
    }
    case "agregar":
      return {
        ...e,
        pizarra: {
          ...e.pizarra,
          elementos: [...e.pizarra.elementos, a.elemento],
          pasos: pasos.map((p) => ({ ...p, posiciones: { ...p.posiciones, [a.elemento.id]: limitar(a.en) } })),
        },
      };
    case "borrar": {
      const fuera = new Set(a.ids);
      return {
        ...e,
        pizarra: {
          ...e.pizarra,
          elementos: e.pizarra.elementos.filter((x) => !fuera.has(x.id)),
          pasos: pasos.map((p) => ({
            ...p,
            posiciones: Object.fromEntries(Object.entries(p.posiciones).filter(([id]) => !fuera.has(id))),
            trazos: p.trazos.filter((t) => !fuera.has(t.elementoId)),
          })),
        },
      };
    }
    case "elemento":
      return { ...e, pizarra: { ...e.pizarra, elementos: e.pizarra.elementos.map((x) => (x.id === a.id ? { ...x, ...a.cambios } : x)) } };
    case "duplicar": {
      let x = e;
      a.ids.forEach((id, i) => {
        const el = e.pizarra.elementos.find((y) => y.id === id);
        const en = pasos[a.paso]?.posiciones[id];
        if (el && en) x = aplicar(x, { tipo: "agregar", elemento: { ...el, id: a.nuevosIds[i] }, en: { x: en.x + 2, y: en.y + 2 } });
      });
      return x;
    }
    case "alinear": {
      const pos = pasos[a.paso].posiciones;
      const vals = a.ids.map((id) => pos[id]?.[a.eje]).filter((v): v is number => v !== undefined);
      if (vals.length < 2) return e;
      const medio = vals.reduce((s, v) => s + v, 0) / vals.length;
      return aplicar(e, { tipo: "mover", paso: a.paso, posiciones: Object.fromEntries(a.ids.filter((id) => pos[id]).map((id) => [id, { ...pos[id], [a.eje]: medio }])) });
    }
    case "trazo": {
      let ps = pasos.map((p) => ({ ...p, posiciones: { ...p.posiciones }, trazos: p.trazos.slice() }));
      if (a.paso === ps.length - 1) {
        if (ps.length >= MAX_PASOS) return e;
        ps = [...ps, { duracionMs: 900, posiciones: { ...ps[a.paso].posiciones }, trazos: [] }];
      }
      const p = ps[a.paso];
      const desde = p.posiciones[a.trazo.elementoId];
      if (!desde) return e;
      const t: Trazo = { ...a.trazo, desde, hasta: limitar(a.trazo.hasta) };
      // Un elemento hace un solo trazo por paso: el nuevo reemplaza al anterior.
      p.trazos = [...p.trazos.filter((x) => x.elementoId !== t.elementoId), t];
      const sig = ps[a.paso + 1];
      sig.posiciones[t.elementoId] = t.hasta;
      const bochas = e.pizarra.elementos.filter((x) => x.tipo === "bocha").map((x) => x.id);
      const acompana = bochaQueAcompana(p, t, bochas);
      if (acompana) {
        const b = p.posiciones[acompana];
        sig.posiciones[acompana] = limitar({ x: t.hasta.x + (b.x - desde.x), y: t.hasta.y + (b.y - desde.y) });
      }
      return conPasos(e, sanear(ps));
    }
    case "control": {
      const ps = pasos.map((p, i) => (i === a.paso ? { ...p, trazos: p.trazos.map((t, k) => (k === a.indice ? { ...t, control: a.control && limitar(a.control) } : t)) } : p));
      return conPasos(e, ps);
    }
    case "borrarTrazo":
      return conPasos(e, pasos.map((p, i) => (i === a.paso ? { ...p, trazos: p.trazos.filter((_, k) => k !== a.indice) } : p)));
    case "agregarPaso": {
      if (pasos.length >= MAX_PASOS) return e;
      const base = pasos[a.despuesDe];
      const nuevo: Paso = { duracionMs: 1600, posiciones: { ...base.posiciones }, trazos: [] };
      return conPasos(e, sanear([...pasos.slice(0, a.despuesDe + 1), nuevo, ...pasos.slice(a.despuesDe + 1)]));
    }
    case "duplicarPaso": {
      if (pasos.length >= MAX_PASOS) return e;
      const copia = structuredClone(pasos[a.paso]);
      return conPasos(e, sanear([...pasos.slice(0, a.paso + 1), copia, ...pasos.slice(a.paso + 1)]));
    }
    case "moverPaso": {
      if (a.hasta < 0 || a.hasta >= pasos.length) return e;
      const ps = pasos.slice();
      const [x] = ps.splice(a.desde, 1);
      ps.splice(a.hasta, 0, x);
      return conPasos(e, sanear(ps));
    }
    case "borrarPaso":
      if (pasos.length <= 1) return e;
      return conPasos(e, sanear(pasos.filter((_, i) => i !== a.paso)));
    case "duracionPaso":
      return conPasos(e, pasos.map((p, i) => (i === a.paso ? { ...p, duracionMs: Math.max(300, Math.min(6000, a.ms)) } : p)));
    case "vista":
      return { ...e, pizarra: { ...e.pizarra, vista: a.vista, encuadre: undefined } };
    case "ficha":
      return { ...e, ...a.cambios };
  }
}

// ---------------------------------------------------------------------------
// Historial: deshacer y rehacer.

export interface Historial {
  pasado: Ejercicio[];
  presente: Ejercicio;
  futuro: Ejercicio[];
}

export type AccionHistorial = Accion | { tipo: "deshacer" } | { tipo: "rehacer" } | { tipo: "cargar"; ejercicio: Ejercicio };

export function conHistorial(h: Historial, a: AccionHistorial): Historial {
  if (a.tipo === "cargar") return { pasado: [], presente: a.ejercicio, futuro: [] };
  if (a.tipo === "deshacer") {
    if (!h.pasado.length) return h;
    return { pasado: h.pasado.slice(0, -1), presente: h.pasado[h.pasado.length - 1], futuro: [h.presente, ...h.futuro] };
  }
  if (a.tipo === "rehacer") {
    if (!h.futuro.length) return h;
    return { pasado: [...h.pasado, h.presente], presente: h.futuro[0], futuro: h.futuro.slice(1) };
  }
  const nuevo = aplicar(h.presente, a);
  if (nuevo === h.presente) return h;
  return { pasado: [...h.pasado, h.presente].slice(-80), presente: nuevo, futuro: [] };
}

/** Ejercicio vacío para empezar de cero (o un boceto del celu). */
export function ejercicioVacio(id: string, autor: string): Ejercicio {
  return {
    id,
    nombre: "",
    fase: "principal",
    jugadores: { min: 4, max: 30 },
    formato: { tipo: "parejas" },
    niveles: ["inicial", "intermedio", "avanzado"],
    intensidad: 2,
    arqueros: "no",
    objetivos: [],
    categorias: ["menores", "juveniles", "mayores"],
    espacio: "media",
    material: {},
    duracion: { min: 10, max: 20 },
    organizacion: "",
    consigna: "",
    puntosClave: [],
    errores: [],
    variantes: {},
    pizarra: { vista: "media", elementos: [], pasos: [{ duracionMs: 1600, posiciones: {}, trazos: [] }] },
    autor,
    estado: "borrador",
    actualizado: 0,
  };
}
