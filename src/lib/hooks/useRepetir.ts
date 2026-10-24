"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Botón que repite mientras se mantiene apretado (±): un toque suma uno al instante;
 * si se mantiene, después de 400 ms sigue sumando cada 90 ms.
 */
export function useRepetir(accion: () => void) {
  const ultima = useRef(accion);
  const timers = useRef<{ espera?: number; ciclo?: number }>({});
  useEffect(() => {
    ultima.current = accion;
  }, [accion]);

  const cortar = useCallback(() => {
    window.clearTimeout(timers.current.espera);
    window.clearInterval(timers.current.ciclo);
    timers.current = {};
  }, []);

  useEffect(() => cortar, [cortar]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      cortar();
      ultima.current();
      timers.current.espera = window.setTimeout(() => {
        timers.current.ciclo = window.setInterval(() => ultima.current(), 90);
      }, 400);
    },
    [cortar],
  );

  // Teclado (Enter / espacio) dispara onClick sin pointerdown: se maneja aparte.
  const onClick = useCallback((e: React.MouseEvent) => {
    if (e.detail === 0) ultima.current();
  }, []);

  return { onPointerDown, onPointerUp: cortar, onPointerLeave: cortar, onPointerCancel: cortar, onClick, onContextMenu: (e: React.MouseEvent) => e.preventDefault() };
}
