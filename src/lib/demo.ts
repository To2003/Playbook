"use client";

import type { Armado } from "./estado/armado";

/**
 * Modo demo para grabar el trailer: con `?demo=1` en la URL queda prendido en la pestaña
 * (sessionStorage) y cada toma sale igual: el armado arranca de valores fijos y la sesión
 * se genera con semilla fija y sin historial.
 */
const CLAVE = "pb-demo";
export const SEMILLA_DEMO = 20261026;
/** Punto de partida de la toma: desde acá se tocan + hasta 11, el arquero, intermedio y media. */
export const ARMADO_DEMO: Armado = { jugadores: 7, arqueros: 0, tipo: "completa", nivel: "inicial", intensidad: 1, duracion: 90, espacio: "media" };

export function esDemo(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(location.search).get("demo") === "1") sessionStorage.setItem(CLAVE, "1");
    return sessionStorage.getItem(CLAVE) === "1";
  } catch {
    return false;
  }
}
