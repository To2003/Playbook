import { crearAzar, semillaDe } from "./azar";
import { aplicable, dividir } from "./division";
import { type FaseBloque, type NumBloque, planDeTiempos } from "./tiempos";
import { validarEjercicio } from "../validador";
import type { BloqueSesion, Ejercicio, Espacio, ItemSesion, Nivel, ParamsSesion, Sesion } from "../tipos";
import { esPausa } from "../tipos";

const RANGO_ESPACIO: Record<Espacio, number> = { area: 1, cuarto: 1, media: 2, completa: 3 };
const NOMBRE_NIVEL: Record<Nivel, string> = { inicial: "inicial", intermedio: "intermedio", avanzado: "avanzado" };

export interface Relajar {
  nivel?: Nivel;
  intensidad?: boolean;
  objetivo?: boolean;
}

interface Contexto {
  params: ParamsSesion;
  /** Ejercicios de las últimas 3 sesiones (se evitan si hay alternativa). */
  recientes: Set<string>;
  /** Ya usados o mostrados en esta sesión: no se repiten. */
  excluidos: Set<string>;
  /** El bloque está pegado a la vuelta a la calma. */
  antesDeLaCalma: boolean;
  bloque: NumBloque;
  relajar?: Relajar;
}

/** Ejercicios que pueden entrar al motor: los base y los propios con fase y rango de jugadores. */
export function utilizables(biblioteca: Ejercicio[]): Ejercicio[] {
  return biblioteca.filter((e) => e.autor === "base" || (e.fase && e.jugadores && validarEjercicio(e, { base: false }).length === 0));
}

/** Filtros duros de 4.2 y 4.3 del SPEC, en orden. */
function pasaFiltros(e: Ejercicio, fase: FaseBloque, ctx: Contexto, conMaterial: boolean): boolean {
  const { params, relajar } = ctx;
  const nivel = relajar?.nivel ?? params.nivel;
  if (e.fase !== fase) return false;
  if (ctx.excluidos.has(e.id)) return false;
  if (!aplicable(e, params.jugadores)) return false;
  if (!e.niveles.includes(nivel)) return false;
  if (e.arqueros === "requerido" && params.arqueros === 0) return false;
  if (conMaterial) {
    if (params.espacio && RANGO_ESPACIO[e.espacio] > RANGO_ESPACIO[params.espacio]) return false;
    if (params.material) {
      for (const [k, v] of Object.entries(e.material)) {
        if (v && !((params.material as Record<string, number | undefined>)[k] ?? 0)) return false;
      }
    }
  }
  if (!relajar?.intensidad && params.intensidad === 1 && (ctx.bloque === 3 || ctx.bloque === 4) && e.intensidad > 2) return false;
  return true;
}

function puntaje(e: Ejercicio, ctx: Contexto, azar: () => number): number {
  const { params, relajar } = ctx;
  let p = azar() * 8;
  if (!relajar?.objetivo && params.objetivo && (ctx.bloque === 3 || ctx.bloque === 4) && e.objetivos.includes(params.objetivo)) p += 30;
  if (!ctx.recientes.has(e.id)) p += 20;
  if (params.intensidad === 2 && e.intensidad === 2) p += 10;
  if (params.intensidad === 3 && (ctx.bloque === 3 || ctx.bloque === 4) && e.intensidad === 3) p += 15;
  if (params.intensidad === 1 && e.intensidad === 1) p += 5;
  // La intensidad sube y después baja: la entrada en calor arranca suave.
  if (ctx.bloque === 1 && e.intensidad === 1) p += 6;
  if (e.autor !== "base" && e.favorito) p += 5;
  return p;
}

/** Candidatos para un bloque, del mejor al peor. */
export function candidatos(biblioteca: Ejercicio[], fase: FaseBloque, ctx: Contexto, azar: () => number): Ejercicio[] {
  let lista = biblioteca.filter((e) => pasaFiltros(e, fase, ctx, true));
  // Material y espacio se aflojan solo si no queda nada.
  if (!lista.length) lista = biblioteca.filter((e) => pasaFiltros(e, fase, ctx, false));
  // Nunca un 3 pegado a la vuelta a la calma si hay con qué reemplazarlo.
  if (ctx.antesDeLaCalma && !ctx.relajar?.intensidad) {
    const suaves = lista.filter((e) => e.intensidad <= 2);
    if (suaves.length) lista = suaves;
  }
  return lista
    .map((e) => ({ e, p: puntaje(e, ctx, azar) }))
    .sort((a, b) => b.p - a.p || a.e.id.localeCompare(b.e.id))
    .map((x) => x.e);
}

function tareaArquero(e: Ejercicio, params: ParamsSesion, tareas: Ejercicio[], usadas: string[], azar: () => number): string | undefined {
  if (params.arqueros === 0 || e.arqueros !== "no" || !tareas.length) return undefined;
  const libres = tareas.filter((t) => !usadas.includes(t.id));
  const pool = libres.length ? libres : tareas;
  return pool[Math.floor(azar() * pool.length)].id;
}

function armarBloque(
  id: string,
  e: Ejercicio,
  bloque: NumBloque,
  minutos: number,
  params: ParamsSesion,
  tareas: Ejercicio[],
  usadas: string[],
  azar: () => number,
): BloqueSesion {
  return {
    id,
    bloque,
    fase: e.fase as FaseBloque,
    minutos,
    ejercicioId: e.id,
    division: dividir(params.jugadores, e.formato, e.jugadores.max, { conBocha: e.fase !== "calor_sin_bocha" && !!e.material.bochas }),
    tareaArqueroId: tareaArquero(e, params, tareas, usadas, azar),
  };
}

/**
 * Motor de generación (SPEC 4): función pura y determinística para una semilla dada.
 * `historial`: ids de ejercicios de sesiones anteriores, la más reciente primero.
 */
export function generarSesion(params: ParamsSesion, biblioteca: Ejercicio[], historial: string[][], semilla: number, ahora = 0): Sesion {
  const azar = crearAzar(semilla);
  const lista = utilizables(biblioteca);
  const tareas = lista.filter((e) => e.fase === "arquero");
  const recientes = new Set(historial.slice(0, 3).flat());
  const plan = planDeTiempos(params.tipo, params.duracion, params.intensidad);
  const excluidos = new Set<string>();
  const usadasArquero: string[] = [];
  const items: ItemSesion[] = [];

  plan.forEach((h, i) => {
    const id = `i${i}`;
    if ("pausa" in h) {
      items.push({ id, pausa: true, minutos: h.minutos });
      return;
    }
    const siguiente = plan.slice(i + 1).find((x) => !("pausa" in x));
    const antesDeLaCalma = !!siguiente && "bloque" in siguiente && siguiente.bloque === 5;
    const ctx: Contexto = { params, recientes, excluidos, antesDeLaCalma, bloque: h.bloque };
    const [elegido] = candidatos(lista, h.fase, ctx, azar);
    if (!elegido) throw new Error(`No hay ejercicios de ${h.fase} para ${params.jugadores} en ${params.nivel}`);
    excluidos.add(elegido.id);
    const b = armarBloque(id, elegido, h.bloque, h.minutos, params, tareas, usadasArquero, azar);
    if (b.tareaArqueroId) usadasArquero.push(b.tareaArqueroId);
    items.push(b);
  });

  return { id: `s${semilla.toString(36)}`, fecha: ahora, params, semilla, items, mostrados: [...excluidos], actualizado: ahora };
}

export type ResultadoOtro =
  | { ok: true; sesion: Sesion; ejercicio: Ejercicio }
  | { ok: false; motivo: string; sugerencias: { etiqueta: string; relajar: Relajar }[] };

/** "Dame otro" (SPEC 4.5): el siguiente candidato que cumple los mismos filtros, nunca uno ya mostrado. */
export function dameOtro(sesion: Sesion, itemId: string, biblioteca: Ejercicio[], historial: string[][], relajar?: Relajar): ResultadoOtro {
  const idx = sesion.items.findIndex((x) => x.id === itemId);
  const item = sesion.items[idx];
  if (!item || esPausa(item)) return { ok: false, motivo: "Ese bloque no se puede cambiar.", sugerencias: [] };
  const { params } = sesion;
  const lista = utilizables(biblioteca);
  const tareas = lista.filter((e) => e.fase === "arquero");
  const azar = crearAzar(semillaDe(sesion.semilla, itemId, sesion.mostrados.length));
  const enUso = sesion.items.filter((x): x is BloqueSesion => !esPausa(x)).map((x) => x.ejercicioId);
  const excluidos = new Set([...sesion.mostrados, ...enUso]);
  const siguiente = sesion.items.slice(idx + 1).find((x) => !esPausa(x));
  const antesDeLaCalma = !!siguiente && !esPausa(siguiente) && siguiente.bloque === 5;
  const ctx: Contexto = { params, recientes: new Set(historial.slice(0, 3).flat()), excluidos, antesDeLaCalma, bloque: item.bloque, relajar };
  const [nuevo] = candidatos(lista, item.fase, ctx, azar);

  if (!nuevo) {
    const sugerencias: { etiqueta: string; relajar: Relajar }[] = [];
    const vecinos: Record<Nivel, Nivel[]> = { inicial: ["intermedio"], intermedio: ["inicial", "avanzado"], avanzado: ["intermedio"] };
    for (const n of vecinos[relajar?.nivel ?? params.nivel]) sugerencias.push({ etiqueta: `Probá en ${NOMBRE_NIVEL[n]}`, relajar: { ...relajar, nivel: n } });
    if (!relajar?.intensidad) sugerencias.push({ etiqueta: "Cualquier intensidad", relajar: { ...relajar, intensidad: true } });
    if (params.objetivo && !relajar?.objetivo) sugerencias.push({ etiqueta: "Sin objetivo", relajar: { ...relajar, objetivo: true } });
    return { ok: false, motivo: `No tengo otro para ${params.jugadores} en ${NOMBRE_NIVEL[relajar?.nivel ?? params.nivel]}. ¿Aflojamos algo?`, sugerencias };
  }

  const usadas = sesion.items.filter((x): x is BloqueSesion => !esPausa(x) && x.id !== itemId).map((x) => x.tareaArqueroId).filter((x): x is string => !!x);
  const bloque = armarBloque(itemId, nuevo, item.bloque, item.minutos, params, tareas, usadas, azar);
  const items = sesion.items.map((x) => (x.id === itemId ? bloque : x));
  return { ok: true, ejercicio: nuevo, sesion: { ...sesion, items, mostrados: [...sesion.mostrados, nuevo.id] } };
}

/** ± minutos de un bloque (nunca baja de 1). */
export function ajustarMinutos(sesion: Sesion, itemId: string, delta: number): Sesion {
  return { ...sesion, items: sesion.items.map((x) => (x.id === itemId && !esPausa(x) ? { ...x, minutos: Math.max(1, Math.min(60, x.minutos + delta)) } : x)) };
}

/** Reordenar arrastrando: mueve un ítem a otra posición. */
export function moverItem(sesion: Sesion, desde: number, hasta: number): Sesion {
  const items = sesion.items.slice();
  const [x] = items.splice(desde, 1);
  items.splice(hasta, 0, x);
  return { ...sesion, items };
}

export const minutosTotales = (s: Pick<Sesion, "items">) => s.items.reduce((t, x) => t + x.minutos, 0);
