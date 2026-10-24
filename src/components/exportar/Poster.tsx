import type { Ref } from "react";
import { PizarraSVG } from "@/components/pizarra/PizarraSVG";
import { POSTER, partirTitulo } from "@/lib/exportar/png";
import { NOMBRE_FASE, NOMBRE_INTENSIDAD } from "@/lib/nombres";
import type { Ejercicio } from "@/lib/tipos";

const M = 64; // margen
const PIZARRA = { x: M, y: 372, w: POSTER.ancho - M * 2, h: 858 };
const FUENTE = '"PB Archivo", var(--font-archivo), system-ui, sans-serif';

/**
 * Póster 1080 × 1350 (4:5, lo que WhatsApp muestra entero): nombre en voz de marcador,
 * datos de la ficha, la pizarra en su paso final con todos los trazos y la marca abajo.
 * Se monta fuera de pantalla solo para exportarlo.
 */
export function Poster({ e, svgRef }: { e: Ejercicio; svgRef?: Ref<SVGSVGElement> }) {
  const { lineas, escala } = partirTitulo(e.nombre || "Ejercicio sin nombre", 19);
  const cuerpo = Math.round(104 * escala);
  const jug = e.jugadores.min === e.jugadores.max ? `${e.jugadores.min}` : `${e.jugadores.min}–${e.jugadores.max}`;
  const datos = [NOMBRE_FASE[e.fase], `${jug} ${e.fase === "arquero" ? "arqueros" : "jugadores"}`, `Intensidad ${NOMBRE_INTENSIDAD[e.intensidad].toLowerCase()}`].join("  ·  ");
  const baseTitulo = 300 - (lineas.length - 1) * cuerpo * 0.92;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${POSTER.ancho} ${POSTER.alto}`}
      width={POSTER.ancho}
      height={POSTER.alto}
      style={{ fontFamily: FUENTE }}
      role="img"
      aria-label={`Póster: ${e.nombre}`}
    >
      <rect width={POSTER.ancho} height={POSTER.alto} fill="var(--ground)" />
      {/* Marca: el peto lima y el nombre, chicos, arriba a la izquierda. */}
      <rect x={M} y={64} width={22} height={22} rx={3} fill="var(--lime)" />
      <text x={M + 36} y={84} fill="var(--ink)" fontSize={26} fontWeight={800} letterSpacing={3} style={{ fontVariationSettings: '"wdth" 75' }}>
        PLAYBOOK
      </text>
      {lineas.map((l, i) => (
        <text
          key={i}
          x={M}
          y={baseTitulo + i * cuerpo * 0.92}
          fill="var(--ink)"
          fontSize={cuerpo}
          fontWeight={800}
          style={{ fontVariationSettings: '"wdth" 62' }}
        >
          {l}
        </text>
      ))}
      <text x={M} y={346} fill="var(--ink-muted)" fontSize={30} fontWeight={500}>
        {datos}
      </text>
      <clipPath id="poster-recorte">
        <rect x={PIZARRA.x} y={PIZARRA.y} width={PIZARRA.w} height={PIZARRA.h} rx={10} />
      </clipPath>
      <g clipPath="url(#poster-recorte)">
        <rect x={PIZARRA.x} y={PIZARRA.y} width={PIZARRA.w} height={PIZARRA.h} fill="var(--turf-runoff)" />
        <g transform={`translate(${PIZARRA.x} ${PIZARRA.y})`}>
          <PizarraSVG pizarra={e.pizarra} aspecto={PIZARRA.w / PIZARRA.h} tam={{ w: PIZARRA.w, h: PIZARRA.h }} idBase="poster" />
        </g>
      </g>
      <text x={M} y={POSTER.alto - 56} fill="var(--ink-faint)" fontSize={24} fontWeight={500}>
        Armado con Playbook · pizarra en su paso final
      </text>
    </svg>
  );
}
