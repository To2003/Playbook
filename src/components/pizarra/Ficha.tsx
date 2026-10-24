import type { Elemento, Punto } from "@/lib/tipos";

const r = (n: number) => Math.round(n * 100) / 100;

interface Props {
  elemento: Elemento;
  en: Punto;
  /** Radio de referencia de una ficha de jugador, en metros. */
  radio: number;
  /** La pizarra está rotada (vista parada): las etiquetas se enderezan. */
  girada?: boolean;
}

/**
 * Cada ficha se distingue por forma, no solo por color (se usa al sol):
 * equipo A círculo, equipo B cuadrado, comodín rombo, arquero con borde grueso y anillo.
 */
export function Ficha({ elemento, en, radio, girada }: Props) {
  return (
    <g transform={`translate(${r(en.x)} ${r(en.y)})`} data-el={elemento.id}>
      <Forma elemento={elemento} rad={radio} girada={girada} />
    </g>
  );
}

function Etiqueta({ texto, rad, color, girada }: { texto?: string; rad: number; color: string; girada?: boolean }) {
  if (!texto) return null;
  return (
    <text
      y={rad * 0.4}
      transform={girada ? "rotate(90)" : undefined}
      textAnchor="middle"
      fontSize={rad * (texto.length > 1 ? 1.0 : 1.2)}
      fill={color}
      style={{ fontVariationSettings: '"wdth" 62', fontWeight: 800 }}
    >
      {texto}
    </text>
  );
}

const BORDE = { stroke: "var(--ficha-borde)" } as const;

function Forma({ elemento, rad, girada }: { elemento: Elemento; rad: number; girada?: boolean }) {
  const { tipo, equipo, etiqueta } = elemento;
  switch (tipo) {
    case "jugador":
      if (equipo === "B") {
        const s = rad * 1.72;
        return (
          <>
            <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={rad * 0.22} fill="var(--coral)" {...BORDE} strokeWidth={rad * 0.14} />
            <Etiqueta texto={etiqueta} rad={rad} color="var(--on-lime)" girada={girada} />
          </>
        );
      }
      if (equipo === "C") {
        const d = rad * 1.25;
        return (
          <>
            <path d={`M0 ${-d}L${d} 0L0 ${d}L${-d} 0Z`} fill="var(--wildcard)" {...BORDE} strokeWidth={rad * 0.14} />
            <Etiqueta texto={etiqueta} rad={rad * 0.9} color="var(--on-lime)" girada={girada} />
          </>
        );
      }
      return (
        <>
          <circle r={rad} fill="var(--lime)" {...BORDE} strokeWidth={rad * 0.14} />
          <Etiqueta texto={etiqueta} rad={rad} color="var(--on-lime)" girada={girada} />
        </>
      );
    case "arquero":
      return (
        <>
          <circle r={rad * 1.32} fill="none" stroke="var(--keeper)" strokeWidth={rad * 0.14} />
          <circle r={rad * 0.98} fill="var(--keeper)" stroke="var(--keeper-edge)" strokeWidth={rad * 0.26} />
          <Etiqueta texto={etiqueta} rad={rad * 0.85} color="var(--keeper-edge)" girada={girada} />
        </>
      );
    case "bocha":
      return <circle r={rad * 0.4} fill="#ffffff" stroke="var(--keeper-edge)" strokeWidth={rad * 0.1} />;
    case "cono": {
      const t = rad * 0.62;
      return <path d={`M0 ${-t}L${t * 0.95} ${t * 0.7}L${-t * 0.95} ${t * 0.7}Z`} fill="var(--cone)" transform={girada ? "rotate(90)" : undefined} />;
    }
    case "valla":
      return <rect x={-rad * 0.18} y={-rad * 1.2} width={rad * 0.36} height={rad * 2.4} fill="var(--wildcard)" {...BORDE} strokeWidth={rad * 0.06} />;
    case "aro":
      return <circle r={rad * 0.85} fill="none" stroke="var(--cone)" strokeWidth={rad * 0.2} />;
    case "arco_chico":
      // Abierto hacia la izquierda de la cancha (se ataca hacia la derecha).
      return (
        <path
          d={`M${-rad * 0.6} ${-rad * 1.3}H${rad * 0.4}V${rad * 1.3}H${-rad * 0.6}`}
          fill="none"
          stroke="var(--chalk)"
          strokeWidth={rad * 0.26}
        />
      );
    case "zona": {
      const w = elemento.tam?.w ?? 10;
      const h = elemento.tam?.h ?? 10;
      return (
        <rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          fill="var(--chalk)"
          fillOpacity={0.1}
          stroke="var(--chalk)"
          strokeOpacity={0.55}
          strokeWidth={rad * 0.16}
          strokeDasharray={`${rad * 0.6} ${rad * 0.45}`}
        />
      );
    }
    case "texto":
      return (
        <text
          textAnchor="middle"
          y={rad * 0.4}
          transform={girada ? "rotate(90)" : undefined}
          fontSize={rad * 1.1}
          fill="var(--chalk)"
          style={{ fontWeight: 600 }}
        >
          {etiqueta}
        </text>
      );
  }
}
