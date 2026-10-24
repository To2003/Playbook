"use client";

import { useSyncExternalStore } from "react";
import { fechaLarga } from "../nombres";

const nada = () => () => {};

/** La fecha de hoy en palabras ("Jueves 23 de octubre"); vacía en el servidor. */
export function useHoy(): string {
  return useSyncExternalStore(nada, () => fechaLarga(Date.now()), () => "");
}
