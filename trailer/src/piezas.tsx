import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, EASE_OUT, FUENTE, MARCADOR } from "./marca";

const salida = Easing.bezier(...EASE_OUT);

/** Sintético azul con franjas de corte y fibra, como la cancha de la app. */
export function Cesped({ opacidad = 1 }: { opacidad?: number }) {
  return (
    <AbsoluteFill style={{ opacity: opacidad }}>
      <svg width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <pattern id="fibra" width="24" height="24" patternUnits="userSpaceOnUse">
            <g strokeWidth="1.3" strokeLinecap="round">
              <path d="M1.5 4.5l3.3.75M13.5 2.25l2.7 1.8M7.5 13.5l3.75-.6M18.75 16.5l3 1.5M3 20.25l2.4-1.5" stroke={C.fiberLight} opacity="0.55" />
              <path d="M9 6.75l3 1.2M19.5 7.5l2.1-1.8M14.25 21l3.3.3M2.25 12l2.7 1.5" stroke={C.fiberDark} opacity="0.6" />
            </g>
          </pattern>
          <pattern id="franjas" width="10" height="384" patternUnits="userSpaceOnUse">
            <rect width="10" height="192" fill={C.turf} />
            <rect y="192" width="10" height="192" fill={C.turfStripe} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#franjas)" />
        <rect width="100%" height="100%" fill="url(#fibra)" />
      </svg>
      {/* Velo oscuro arriba: los títulos se leen sobre el pasto. */}
      <AbsoluteFill style={{ background: `linear-gradient(${C.ground}e6 0%, ${C.ground}b3 26%, ${C.ground}00 46%)` }} />
    </AbsoluteFill>
  );
}

const L = 91.4;
const A = 55;
const R = 14.63;
const RP = 19.63;
const POSTE_I = A / 2 - 1.83;
const POSTE_D = A / 2 + 1.83;

function area(fondo: 0 | typeof L, radio: number) {
  const dir = fondo === 0 ? 1 : -1;
  const s = fondo === 0 ? 0 : 1;
  const y = fondo + dir * radio;
  return `M${POSTE_I - radio} ${fondo}A${radio} ${radio} 0 0 ${s} ${POSTE_I} ${y}L${POSTE_D} ${y}A${radio} ${radio} 0 0 ${s} ${POSTE_D + radio} ${fondo}`;
}

/** Líneas de una cancha parada (55 × 91,4 m) que se dibujan en tiza con `progreso` de 0 a 1. */
export function CanchaTiza({ progreso, alto, estilo }: { progreso: number; alto: number; estilo?: CSSProperties }) {
  const trazos = [
    `M0 0H${A}V${L}H0Z`,
    `M0 ${L / 2}H${A}`,
    `M0 22.9H${A}M0 ${L - 22.9}H${A}`,
    area(0, R) + area(L, R),
    `M${POSTE_I} 0V-1.2H${POSTE_D}V0M${POSTE_I} ${L}V${L + 1.2}H${POSTE_D}V${L}`,
  ];
  const ancho = (alto * A) / L;
  return (
    <svg width={ancho} height={alto} viewBox={`-1.5 -2 ${A + 3} ${L + 4}`} style={{ overflow: "visible", ...estilo }}>
      <g fill="none" stroke={C.chalk} strokeWidth={0.32} strokeLinecap="round" strokeLinejoin="round">
        {trazos.map((d, i) => {
          // Cada línea arranca un poco después que la anterior: se ven dibujarse de a una.
          const p = Math.min(1, Math.max(0, progreso * 1.6 - i * 0.15));
          return <path key={i} d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />;
        })}
        <path d={area(0, RP) + area(L, RP)} strokeDasharray="1.1 1.9" opacity={interpolate(progreso, [0.55, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      </g>
      <g fill={C.chalk} opacity={interpolate(progreso, [0.7, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
        <circle cx={A / 2} cy={6.4} r={0.35} />
        <circle cx={A / 2} cy={L - 6.4} r={0.35} />
      </g>
    </svg>
  );
}

/** Celular genérico dibujado en CSS (sin marca): bisel oscuro, borde fino y pantalla redondeada. */
export function Celular({ anchoPantalla, children, estilo }: { anchoPantalla: number; children: ReactNode; estilo?: CSSProperties }) {
  const altoPantalla = (anchoPantalla * 844) / 390;
  const bisel = Math.round(anchoPantalla * 0.03);
  return (
    <div
      style={{
        width: anchoPantalla + bisel * 2,
        height: altoPantalla + bisel * 2,
        padding: bisel,
        borderRadius: anchoPantalla * 0.13,
        background: "#05070c",
        boxShadow: `0 0 0 2px #2b3546, 0 0 0 ${Math.round(bisel * 0.35)}px #05070c`,
        ...estilo,
      }}
    >
      <div style={{ position: "relative", width: anchoPantalla, height: altoPantalla, borderRadius: anchoPantalla * 0.1, overflow: "hidden", background: C.ground }}>
        {children}
      </div>
    </div>
  );
}

/** Título con entrada (sube + aparece) y salida cortas, unos 250 ms cada una. */
export function Titulo({ texto, duracion, tam, estilo, centrado, sinEntrada }: { texto: string; duracion: number; tam: number; estilo?: CSSProperties; centrado?: boolean; /** El primer título ya está: el primer cuadro es la vista previa del video. */ sinEntrada?: boolean }) {
  const f = useCurrentFrame();
  const entra = sinEntrada ? 1 : interpolate(f, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: salida });
  const sale = interpolate(f, [duracion - 7, duracion], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        ...MARCADOR,
        position: "absolute",
        color: C.ink,
        fontSize: tam,
        lineHeight: 0.98,
        letterSpacing: "-0.005em",
        textWrap: "balance",
        textAlign: centrado ? "center" : "left",
        opacity: entra * (1 - sale),
        transform: `translateY(${(1 - entra) * 30 - sale * 14}px)`,
        ...estilo,
      }}
    >
      {texto}
    </div>
  );
}

/** Ficha del equipo A (lima, círculo lleno), como en la app. */
export function FichaA({ tam }: { tam: number }) {
  return <div style={{ width: tam, height: tam, borderRadius: "50%", background: C.lime, boxShadow: `0 0 0 ${tam * 0.06}px ${C.onLime}55` }} />;
}

export { FUENTE };
