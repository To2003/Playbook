"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { AJUSTES_POR_DEFECTO, db } from "../db";
import type { Ajustes } from "../tipos";

export async function leerAjustes(): Promise<Ajustes> {
  const fila = await db().ajustes.get("yo");
  if (!fila) return AJUSTES_POR_DEFECTO;
  const { clave: _clave, ...resto } = fila;
  void _clave;
  return { ...AJUSTES_POR_DEFECTO, ...resto };
}

export async function guardarAjustes(cambios: Partial<Ajustes>): Promise<void> {
  const actuales = await leerAjustes();
  await db().ajustes.put({ ...actuales, ...cambios, clave: "yo" });
}

/** Ajustes en vivo. `undefined` mientras IndexedDB responde (es casi instantáneo). */
export function useAjustes(): Ajustes | undefined {
  return useLiveQuery(leerAjustes, []);
}
