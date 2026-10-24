import type { ItemSesion } from "../tipos";

/**
 * Estado del modo cancha. El tiempo se calcula contra el reloj (`finEn`), no contando ticks:
 * si la pantalla se apaga o el navegador congela la pestaña, al volver el cronómetro está bien.
 */
export interface EstadoCancha {
  indice: number;
  /** Momento en que termina el ítem actual (ms). Nulo si está en pausa. */
  finEn: number | null;
  /** Lo que quedaba al pausar. */
  restanteMs: number;
  /** Se terminó toda la sesión. */
  completa: boolean;
}

export const duracionMs = (items: ItemSesion[], i: number) => (items[i]?.minutos ?? 0) * 60_000;

export function empezar(items: ItemSesion[], ahora: number, indice = 0): EstadoCancha {
  const d = duracionMs(items, indice);
  return { indice, finEn: ahora + d, restanteMs: d, completa: false };
}

export function restante(e: EstadoCancha, ahora: number): number {
  return e.finEn === null ? e.restanteMs : Math.max(0, e.finEn - ahora);
}

export const enPausa = (e: EstadoCancha) => e.finEn === null;

export function pausar(e: EstadoCancha, ahora: number): EstadoCancha {
  return enPausa(e) ? e : { ...e, finEn: null, restanteMs: restante(e, ahora) };
}

export function reanudar(e: EstadoCancha, ahora: number): EstadoCancha {
  return enPausa(e) ? { ...e, finEn: ahora + e.restanteMs } : e;
}

/** Pasa al ítem siguiente (bloque o hidratación) y arranca su cronómetro. */
export function siguiente(e: EstadoCancha, items: ItemSesion[], ahora: number): EstadoCancha {
  const i = e.indice + 1;
  if (i >= items.length) return { ...e, finEn: null, restanteMs: 0, completa: true };
  return empezar(items, ahora, i);
}

export function anterior(e: EstadoCancha, items: ItemSesion[], ahora: number): EstadoCancha {
  return empezar(items, ahora, Math.max(0, e.indice - 1));
}

export function mmss(ms: number): string {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
