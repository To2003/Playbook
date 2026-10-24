"use client";

import { useEffect } from "react";

/**
 * Mantiene la pantalla encendida mientras `activo` (Screen Wake Lock API).
 * El sistema lo suelta al ocultar la pestaña: se vuelve a pedir al volver.
 * Donde no existe, no hace nada.
 */
export function useWakeLock(activo: boolean) {
  useEffect(() => {
    if (!activo || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let candado: WakeLockSentinel | null = null;
    let vivo = true;
    const pedir = async () => {
      try {
        if (document.visibilityState !== "visible") return;
        candado = await navigator.wakeLock.request("screen");
        if (!vivo) await candado.release();
      } catch {
        // Sin permiso o sin batería: silencio, la app sigue andando.
      }
    };
    const alVolver = () => {
      if (document.visibilityState === "visible") void pedir();
    };
    void pedir();
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      vivo = false;
      document.removeEventListener("visibilitychange", alVolver);
      void candado?.release().catch(() => {});
    };
  }, [activo]);
}
