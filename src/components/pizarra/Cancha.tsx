import { CANCHA, type Orientacion, proyector } from "@/lib/pizarra/geometria";
import type { Punto } from "@/lib/pizarra/types";

const r = (n: number) => Math.round(n * 100) / 100;

/** Grosor de la tiza, en metros, según cuánta cancha entra en pantalla. */
export const GROSOR_TIZA = { completa: 0.26, media: 0.22, area: 0.16 } as const;

interface Props {
  orientacion: Orientacion;
  grosor: number;
  /** En modo cancha no hay textura: tiza sobre negro. */
  textura?: boolean;
}

/**
 * Cancha de hockey 11 a escala: sintético azul con franjas de corte, fibra sutil
 * y líneas de tiza. Coordenadas en metros; la proyección decide la orientación.
 */
export function Cancha({ orientacion, grosor, textura = true }: Props) {
  const p = proyector(orientacion);
  const { largo, ancho, linea23, radioArea, radioPunteada, penal, arco, profundidadArco, marcasCorner } = CANCHA;
  const medio = ancho / 2;
  const posteSup = medio - arco / 2;
  const posteInf = medio + arco / 2;

  const pt = (x: number, y: number) => {
    const q = p({ x, y });
    return `${r(q.x)} ${r(q.y)}`;
  };
  const linea = (a: Punto, b: Punto) => `M${pt(a.x, a.y)}L${pt(b.x, b.y)}`;
  const rect = (x0: number, y0: number, x1: number, y1: number) => {
    const a = p({ x: x0, y: y0 });
    const b = p({ x: x1, y: y1 });
    return { x: r(Math.min(a.x, b.x)), y: r(Math.min(a.y, b.y)), width: r(Math.abs(b.x - a.x)), height: r(Math.abs(b.y - a.y)) };
  };

  // Área (círculo de tiro) y línea punteada a 5 m, para cada arco.
  const areaDe = (fondo: number, dir: 1 | -1, radio: number) => {
    const xIn = fondo + dir * radio;
    const sweep = dir === 1 ? 1 : 0;
    return (
      `M${pt(fondo, posteSup - radio)}` +
      `A${radio} ${radio} 0 0 ${sweep} ${pt(xIn, posteSup)}` +
      `L${pt(xIn, posteInf)}` +
      `A${radio} ${radio} 0 0 ${sweep} ${pt(fondo, posteInf + radio)}`
    );
  };

  const franjas = Array.from({ length: 10 }, (_, i) => i);
  const anchoFranja = largo / 10;

  const marcas = [0, largo].flatMap((fondo) => {
    const dir = fondo === 0 ? 1 : -1;
    return marcasCorner.flatMap((d) => [
      linea({ x: fondo, y: posteSup - d }, { x: fondo + dir * 0.6, y: posteSup - d }),
      linea({ x: fondo, y: posteInf + d }, { x: fondo + dir * 0.6, y: posteInf + d }),
    ]);
  });

  const arcos = [0, largo].map((fondo) => {
    const fuera = fondo === 0 ? -profundidadArco : largo + profundidadArco;
    return `M${pt(fondo, posteSup)}L${pt(fuera, posteSup)}L${pt(fuera, posteInf)}L${pt(fondo, posteInf)}`;
  });

  // Más allá de la zona de seguridad sigue el sintético, más oscuro: los encuadres ajustados pueden mostrarlo.
  const exterior = rect(-30, -30, largo + 30, ancho + 30);
  const sintetico = rect(-2.5, -2.5, largo + 2.5, ancho + 2.5);

  return (
    <g aria-hidden="true">
      <rect {...exterior} fill="var(--turf-runoff)" />
      <rect {...sintetico} fill="var(--turf)" />
      {textura &&
        franjas
          .filter((i) => i % 2 === 1)
          .map((i) => <rect key={i} {...rect(i * anchoFranja, -2.5, (i + 1) * anchoFranja, ancho + 2.5)} fill="var(--turf-stripe)" />)}
      {textura && <rect {...exterior} fill="url(#pb-fibra)" />}

      <g fill="none" stroke="var(--chalk)" strokeWidth={grosor} strokeLinecap="butt" strokeLinejoin="miter">
        <rect {...rect(0, 0, largo, ancho)} />
        <path d={linea({ x: largo / 2, y: 0 }, { x: largo / 2, y: ancho })} />
        <path d={linea({ x: linea23, y: 0 }, { x: linea23, y: ancho })} />
        <path d={linea({ x: largo - linea23, y: 0 }, { x: largo - linea23, y: ancho })} />
        <path d={areaDe(0, 1, radioArea)} />
        <path d={areaDe(largo, -1, radioArea)} />
        <path d={areaDe(0, 1, radioPunteada)} strokeDasharray={`${grosor * 4} ${grosor * 7}`} />
        <path d={areaDe(largo, -1, radioPunteada)} strokeDasharray={`${grosor * 4} ${grosor * 7}`} />
        <path d={marcas.join("")} />
        <path d={arcos.join("")} strokeWidth={grosor * 1.6} />
      </g>
      {[penal, largo - penal].map((x) => {
        const c = p({ x, y: medio });
        return <circle key={x} cx={r(c.x)} cy={r(c.y)} r={grosor * 0.9} fill="var(--chalk)" />;
      })}
    </g>
  );
}

/** Defs compartidas por todas las pizarras (la fibra del sintético). */
export function DefsCancha() {
  return (
    <defs>
      <pattern id="pb-fibra" width="1.6" height="1.6" patternUnits="userSpaceOnUse">
        <g strokeWidth="0.09" strokeLinecap="round">
          <path d="M0.1 0.3l0.22 0.05M0.9 0.15l0.18 0.12M0.5 0.9l0.25 -0.04M1.25 1.1l0.2 0.1M0.2 1.35l0.16 -0.1" stroke="var(--turf-fiber-light)" opacity="0.55" />
          <path d="M0.6 0.45l0.2 0.08M1.3 0.5l0.14 -0.12M0.95 1.4l0.22 0.02M0.15 0.8l0.18 0.1" stroke="var(--turf-fiber-dark)" opacity="0.6" />
        </g>
      </pattern>
    </defs>
  );
}
