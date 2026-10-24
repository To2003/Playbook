"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PizarraSVG } from "./PizarraSVG";
import { construirLinea } from "./linea";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMovimientoReducido } from "@/lib/hooks/useMovimientoReducido";
import type { Pizarra } from "@/lib/tipos";

export interface PropsPizarraAnimada {
  pizarra: Pizarra;
  aspecto?: number;
  altoContraste?: boolean;
  className?: string;
  titulo?: string;
  /** Muestra play/pausa, velocidad, loop y pasos. Sin controles se reproduce sola en loop. */
  controles?: boolean;
  /** Se anima solo mientras está en pantalla (miniaturas). */
  soloVisible?: boolean;
}

type Velocidad = 0.5 | 1 | 2;

export function PizarraAnimada({ pizarra, aspecto, altoContraste, className, titulo, controles = false, soloVisible = true }: PropsPizarraAnimada) {
  const reducido = useMovimientoReducido();
  const caja = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const linea = useRef<gsap.core.Timeline | null>(null);
  const idBase = `pz${useId().replace(/[^a-z0-9]/gi, "")}`;
  const [visible, setVisible] = useState(!soloVisible);
  const [reproduciendo, setReproduciendo] = useState(true);
  const [velocidad, setVelocidad] = useState<Velocidad>(1);
  const [enLoop, setEnLoop] = useState(true);
  const [paso, setPaso] = useState(0);
  const total = pizarra.pasos.length;

  // Miniaturas: solo se animan mientras se ven.
  useEffect(() => {
    if (!soloVisible || !caja.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "80px" });
    io.observe(caja.current);
    return () => io.disconnect();
  }, [soloVisible]);

  useGSAP(
    () => {
      if (reducido || !svgRef.current) return;
      const tl = construirLinea(svgRef.current, pizarra);
      tl.repeat(-1);
      tl.eventCallback("onUpdate", () => {
        const etiqueta = tl.currentLabel();
        const i = etiqueta === "fin" ? total - 1 : Number(etiqueta?.slice(1) ?? 0);
        setPaso((prev) => (prev === i ? prev : i));
      });
      linea.current = tl;
      return () => {
        linea.current = null;
      };
    },
    { scope: svgRef, dependencies: [pizarra, reducido], revertOnUpdate: true },
  );

  useEffect(() => {
    const tl = linea.current;
    if (!tl) return;
    tl.timeScale(velocidad);
    tl.repeat(enLoop ? -1 : 0);
    if (reproduciendo && visible) {
      if (!enLoop && tl.progress() === 1) tl.restart();
      else tl.play();
    } else tl.pause();
  }, [reproduciendo, visible, velocidad, enLoop, reducido, pizarra]);

  const irA = (i: number) => {
    const tl = linea.current;
    if (!tl) return;
    const destino = Math.max(0, Math.min(total - 1, i));
    setReproduciendo(false);
    tl.pause();
    tl.seek(destino === total - 1 ? "fin" : `p${destino}`, false);
    setPaso(destino);
  };

  return (
    <div ref={caja} className={className}>
      <PizarraSVG
        pizarra={pizarra}
        aspecto={aspecto}
        altoContraste={altoContraste}
        modo={reducido ? "final" : "inicio"}
        titulo={titulo}
        svgRef={svgRef}
        idBase={idBase}
        className="h-auto w-full"
      />
      {controles &&
        (reducido ? (
          <p className="px-1 pt-2 text-meta text-ink-faint">Movimiento reducido: ves el paso final con todos los trazos.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-1 pt-2" role="group" aria-label="Controles de la pizarra">
            <BotonControl etiqueta="Paso anterior" onClick={() => irA(paso - 1)} disabled={paso === 0}>
              <path d="M6 5v14M18 6l-8 6 8 6z" />
            </BotonControl>
            <BotonControl etiqueta={reproduciendo ? "Pausar" : "Reproducir"} onClick={() => setReproduciendo((v) => !v)} principal>
              {reproduciendo ? <path d="M8 5v14M16 5v14" /> : <path d="M7 5l12 7-12 7z" />}
            </BotonControl>
            <BotonControl etiqueta="Paso siguiente" onClick={() => irA(paso + 1)} disabled={paso >= total - 1}>
              <path d="M18 5v14M6 6l8 6-8 6z" />
            </BotonControl>
            <span className="marcador min-w-[4.5ch] px-1 text-center text-[1.25rem] text-ink-muted" aria-live="polite">
              {paso + 1}/{total}
            </span>
            <div className="ml-auto flex items-center gap-1">
              {([0.5, 1, 2] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={velocidad === v}
                  onClick={() => setVelocidad(v)}
                  className={`pressable marcador h-12 min-w-12 rounded-card px-2 text-[1.125rem] ${velocidad === v ? "bg-ink text-ground" : "bg-raised text-ink-muted"}`}
                >
                  {v === 0.5 ? "½" : v}×
                </button>
              ))}
              <BotonControl etiqueta={enLoop ? "Sacar loop" : "Repetir en loop"} onClick={() => setEnLoop((v) => !v)} activo={enLoop}>
                <path d="M17 2l3 3-3 3M3 11V9a4 4 0 0 1 4-4h13M7 22l-3-3 3-3M21 13v2a4 4 0 0 1-4 4H4" />
              </BotonControl>
            </div>
          </div>
        ))}
    </div>
  );
}

function BotonControl({
  etiqueta,
  onClick,
  disabled,
  principal,
  activo,
  children,
}: {
  etiqueta: string;
  onClick: () => void;
  disabled?: boolean;
  principal?: boolean;
  activo?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      aria-pressed={activo}
      onClick={onClick}
      disabled={disabled}
      className={`pressable grid size-12 place-items-center rounded-card disabled:opacity-35 ${principal || activo ? "bg-ink text-ground" : "bg-raised text-ink"}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}
