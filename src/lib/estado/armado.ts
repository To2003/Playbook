"use client";

import { useSyncExternalStore } from "react";
import { AJUSTES_POR_DEFECTO } from "../db";
import { ARMADO_DEMO, esDemo } from "../demo";
import { guardarAjustes, leerAjustes } from "./ajustes";
import type { Espacio, Intensidad, Nivel, Objetivo, TipoSesion } from "../tipos";

/** Lo que se va eligiendo en las pantallas 1 y 2 antes de armar la sesión. */
export interface Armado {
  jugadores: number;
  arqueros: 0 | 1 | 2;
  tipo: TipoSesion;
  nivel: Nivel;
  intensidad: Intensidad;
  duracion: number;
  objetivo?: Objetivo;
  espacio?: Espacio;
  /** Material de hoy: pisa el de Mi club. */
  material?: Record<string, number>;
}

let estado: Armado = { ...AJUSTES_POR_DEFECTO.ultimo, duracion: AJUSTES_POR_DEFECTO.duracion.completa };
let cargado = false;
const oyentes = new Set<() => void>();

function emitir() {
  oyentes.forEach((f) => f());
}

/** Precarga con los valores de la última sesión y la duración de Mi club (una vez por visita). */
export async function cargarArmado(): Promise<void> {
  if (cargado) return;
  cargado = true;
  if (esDemo()) {
    estado = { ...ARMADO_DEMO };
    emitir();
    return;
  }
  const a = await leerAjustes();
  estado = { ...a.ultimo, duracion: a.duracion[a.ultimo.tipo], espacio: a.espacio };
  emitir();
}

export function cambiarArmado(cambios: Partial<Armado>) {
  estado = { ...estado, ...cambios };
  emitir();
}

export function leerArmado(): Armado {
  return estado;
}

export function useArmado(): Armado {
  return useSyncExternalStore(
    (f) => {
      oyentes.add(f);
      return () => oyentes.delete(f);
    },
    () => estado,
    () => estado,
  );
}

/** Guarda lo elegido como "último" para precargar la próxima vez. */
export async function recordarArmado(a: Armado) {
  await guardarAjustes({ ultimo: { jugadores: a.jugadores, arqueros: a.arqueros, tipo: a.tipo, nivel: a.nivel, intensidad: a.intensidad } });
}
