"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import type { BloqueSesion, Ejercicio, Sesion } from "../tipos";
import { esPausa } from "../tipos";
import { EJERCICIOS_BASE, TAREAS_ARQUERO } from "@/data/biblioteca";
import { encolar } from "../sync/cola";

export async function guardarSesion(s: Sesion): Promise<void> {
  const conFecha = { ...s, actualizado: Date.now() };
  await db().sesiones.put(conFecha);
  await encolar("sesiones", s.id);
}

/** La sesión más reciente (la "de hoy"). */
export function useSesionActual(): Sesion | null | undefined {
  return useLiveQuery(async () => (await db().sesiones.orderBy("fecha").last()) ?? null, []);
}

export function useSesion(id: string | null): Sesion | null | undefined {
  return useLiveQuery(async () => (id ? ((await db().sesiones.get(id)) ?? null) : ((await db().sesiones.orderBy("fecha").last()) ?? null)), [id]);
}

/** Ejercicios de las últimas sesiones, la más reciente primero (para no repetir). */
export async function historialReciente(excluir?: string): Promise<string[][]> {
  const ultimas = await db().sesiones.orderBy("fecha").reverse().limit(4).toArray();
  return ultimas
    .filter((s) => s.id !== excluir)
    .slice(0, 3)
    .map((s) => s.items.filter((x): x is BloqueSesion => !esPausa(x)).map((x) => x.ejercicioId));
}

/** Biblioteca completa: la base empaquetada + los ejercicios propios del dispositivo. */
export function useBiblioteca(): Ejercicio[] {
  const propios = useLiveQuery(() => db().ejercicios.toArray(), []) ?? [];
  return [...EJERCICIOS_BASE, ...TAREAS_ARQUERO, ...propios];
}

export async function bibliotecaCompleta(): Promise<Ejercicio[]> {
  const propios = await db().ejercicios.toArray();
  return [...EJERCICIOS_BASE, ...TAREAS_ARQUERO, ...propios];
}
