import type { Elemento, Punto } from "@/lib/pizarra/types";

const r = (n: number) => Math.round(n * 100) / 100;

interface Props {
  elemento: Elemento;
  en: Punto;
  /** Radio de referencia de una ficha de jugador, en metros. */
  radio: number;
}

/**
 * Cada ficha se distingue por forma, no solo por color (se usa al sol):
 * equipo A círculo, equipo B cuadrado, comodín rombo, arquero con borde grueso y anillo.
 */
export function Ficha({ elemento, en, radio: rad }: Props) {
  return (
    <g transform={`translate(${r(en.x)} ${r(en.y)})`} data-el={elemento.id}>
      <Forma elemento={elemento} rad={rad} />
    </g>
  );
}

function Etiqueta({ texto, rad, color }: { texto?: string; rad: number; color: string }) {
  if (!texto) return null;
  return (
    <text
      y={rad * 0.4}
      textAnchor="middle"
      fontSize={rad * (texto.length > 1 ? 1.0 : 1.2)}
      fill={color}
      style={{ fontVariationSettings: '"wdth" 62', fontWeight: 800 }}
    >
      {texto}
    </text>
  );
}

function Forma({ elemento, rad }: { elemento: Elemento; rad: number }) {
  const { tipo, equipo, etiqueta } = elemento;
  switch (tipo) {
    case "jugador":
      if (equipo === "B") {
        const s = rad * 1.72;
        return (
          <>
            <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={rad * 0.22} fill="var(--coral)" />
            <Etiqueta texto={etiqueta} rad={rad} color="var(--on-lime)" />
          </>
        );
      }
      if (equipo === "comodin") {
        const d = rad * 1.25;
        return (
          <>
            <path d={`M0 ${-d}L${d} 0L0 ${d}L${-d} 0Z`} fill="var(--wildcard)" />
            <Etiqueta texto={etiqueta} rad={rad * 0.9} color="var(--on-lime)" />
          </>
        );
      }
      return (
        <>
          <circle r={rad} fill="var(--lime)" />
          <Etiqueta texto={etiqueta} rad={rad} color="var(--on-lime)" />
        </>
      );
    case "arquero":
      return (
        <>
          <circle r={rad * 1.32} fill="none" stroke="var(--keeper)" strokeWidth={rad * 0.14} />
          <circle r={rad * 0.98} fill="var(--keeper)" stroke="var(--keeper-edge)" strokeWidth={rad * 0.26} />
          <Etiqueta texto={etiqueta} rad={rad * 0.85} color="var(--keeper-edge)" />
        </>
      );
    case "bocha":
      return <circle r={rad * 0.4} fill="#ffffff" stroke="var(--keeper-edge)" strokeWidth={rad * 0.1} />;
    case "cono": {
      const t = rad * 0.62;
      return <path d={`M0 ${-t}L${t * 0.95} ${t * 0.7}L${-t * 0.95} ${t * 0.7}Z`} fill="var(--cone)" />;
    }
    case "valla":
      return (
        <rect
          x={-rad * 1.2}
          y={-rad * 0.18}
          width={rad * 2.4}
          height={rad * 0.36}
          fill="var(--wildcard)"
          transform={elemento.rotacion ? `rotate(${elemento.rotacion})` : undefined}
        />
      );
    case "aro":
      return <circle r={rad * 0.85} fill="none" stroke="var(--keeper)" strokeWidth={rad * 0.18} />;
    case "arco_chico":
      return (
        <path
          d={`M${-rad * 1.3} 0L${-rad * 1.3} ${rad * 0.8}L${rad * 1.3} ${rad * 0.8}L${rad * 1.3} 0`}
          fill="none"
          stroke="var(--chalk)"
          strokeWidth={rad * 0.26}
          transform={elemento.rotacion ? `rotate(${elemento.rotacion})` : undefined}
        />
      );
    case "zona": {
      const w = elemento.ancho ?? 10;
      const h = elemento.alto ?? 10;
      const comun = { fill: "var(--chalk)", fillOpacity: 0.1, stroke: "var(--chalk)", strokeOpacity: 0.55, strokeWidth: rad * 0.16, strokeDasharray: `${rad * 0.6} ${rad * 0.45}` };
      return elemento.forma === "elipse" ? <ellipse rx={w / 2} ry={h / 2} {...comun} /> : <rect x={-w / 2} y={-h / 2} width={w} height={h} {...comun} />;
    }
    case "texto":
      return (
        <text textAnchor="middle" y={rad * 0.4} fontSize={rad * 1.1} fill="var(--chalk)" style={{ fontWeight: 600 }}>
          {etiqueta}
        </text>
      );
  }
}
