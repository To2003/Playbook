"use client";

/**
 * Señal de una sola vez entre pantallas: la sesión recién armada entra "repartida".
 * Si se vuelve a /sesion más tarde, aparece quieta.
 */
let recien: string | null = null;

export function marcarRecienArmada(id: string) {
  recien = id;
}

export function consumirRecienArmada(id: string): boolean {
  if (recien !== id) return false;
  recien = null;
  return true;
}
