import type { Ref } from "react";
import { Cancha, DefsCancha, GROSOR_TIZA } from "./Cancha";
import { Ficha } from "./Ficha";
import {
  RADIO_FICHA,
  ROTACION_VERTICAL,
  VISTAS,
  cajaEnPantalla,
  dibujoTrazo,
  encuadreAjustado,
  orientacionDe,
} from "@/lib/pizarra/geometria";
import type { Elemento, Pizarra } from "@/lib/tipos";

export interface PropsPizarraSVG {
  pizarra: Pizarra;
  /** Proporción en pantalla (ancho / alto). Si se pasa, hace zoom a la jugada. */
  aspecto?: number;
  /** Modo cancha / modo sol: sin textura, tiza más gruesa. */
  altoContraste?: boolean;
  /** `final`: paso final con todos los trazos (estático y reduced motion). `inicio`: listo para animar. */
  modo?: "final" | "inicio";
  className?: string;
  titulo?: string;
  svgRef?: Ref<SVGSVGElement>;
}

// Las zonas van abajo de todo; la bocha arriba de los jugadores.
const capa = (e: Elemento) => (e.tipo === "zona" ? 0 : e.tipo === "bocha" ? 3 : e.tipo === "jugador" || e.tipo === "arquero" ? 2 : 1);

export function PizarraSVG({ pizarra, aspecto, altoContraste = false, modo = "final", className, titulo, svgRef }: PropsPizarraSVG) {
  const orientacion = orientacionDe(pizarra.vista);
  const rad = RADIO_FICHA[pizarra.vista];
  const grosor = GROSOR_TIZA[pizarra.vista] * (altoContraste ? 1.4 : 1);
  const caja = pizarra.encuadre ?? (aspecto ? encuadreAjustado(pizarra, aspecto, rad * 2.6) : VISTAS[pizarra.vista]);
  const vb = cajaEnPantalla(caja, orientacion);
  const paso = modo === "final" ? pizarra.pasos[pizarra.pasos.length - 1] : pizarra.pasos[0];
  const elementos = pizarra.elementos.filter((e) => paso.posiciones[e.id]).sort((a, b) => capa(a) - capa(b));
  const girada = orientacion === "vertical";
  const grosorTrazo = grosor * 1.5;

  return (
    <svg
      ref={svgRef}
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      className={className}
      role="img"
      aria-label={titulo ?? "Pizarra del ejercicio"}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
    >
      <DefsCancha />
      <g transform={girada ? ROTACION_VERTICAL : undefined}>
        <Cancha grosor={grosor} textura={!altoContraste} />
        {elementos
          .filter((e) => e.tipo === "zona")
          .map((e) => (
            <Ficha key={e.id} elemento={e} en={paso.posiciones[e.id]} radio={rad} girada={girada} />
          ))}
        <g fill="none" stroke="var(--chalk)" strokeLinecap="round" strokeLinejoin="round" data-capa="trazos">
          {pizarra.pasos.map((p, ip) =>
            p.trazos.map((t, it) => {
              const { d, punta } = dibujoTrazo(t, rad);
              return (
                <g key={`${ip}-${it}`} data-trazo={`${ip}-${it}`} data-paso={ip}>
                  <path
                    d={d}
                    strokeWidth={t.tipo === "tiro" ? grosorTrazo * 2 : grosorTrazo}
                    strokeDasharray={t.tipo === "pase" ? `${grosorTrazo * 2.2} ${grosorTrazo * 2.4}` : undefined}
                  />
                  <path d={punta} fill="var(--chalk)" stroke="none" data-punta="" />
                </g>
              );
            }),
          )}
        </g>
        {elementos
          .filter((e) => e.tipo !== "zona")
          .map((e) => (
            <Ficha key={e.id} elemento={e} en={paso.posiciones[e.id]} radio={rad} girada={girada} />
          ))}
      </g>
    </svg>
  );
}
