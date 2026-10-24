"use client";

import { useSyncExternalStore } from "react";

const consulta = "(prefers-reduced-motion: reduce)";

function suscribir(cb: () => void) {
  const mq = window.matchMedia(consulta);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** `true` si el sistema pide menos movimiento. En el servidor asume que no. */
export function useMovimientoReducido(): boolean {
  return useSyncExternalStore(
    suscribir,
    () => window.matchMedia(consulta).matches,
    () => false,
  );
}
