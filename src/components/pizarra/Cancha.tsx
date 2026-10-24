import { CANCHA } from "@/lib/pizarra/geometria";

const r = (n: number) => Math.round(n * 100) / 100;

/** Grosor de la tiza, en metros, según cuánta cancha entra en pantalla. */
export const GROSOR_TIZA = { completa: 0.26, media: 0.22, area: 0.16 } as const;

interface Props {
  grosor: number;
  /** En modo cancha y modo sol no hay textura: tiza sobre un fondo liso. */
  textura?: boolean;
}

/**
 * Cancha de hockey 11 a escala: sintético azul con franjas de corte, fibra sutil
 * y líneas de tiza. Coordenadas en metros de cancha; la orientación la da el grupo padre.
 */
export function Cancha({ grosor, textura = true }: Props) {
  const { largo, ancho, linea23, radioArea, radioPunteada, penal, arco, profundidadArco, marcasCorner } = CANCHA;
  const medio = ancho / 2;
  const posteSup = medio - arco / 2;
  const posteInf = medio + arco / 2;

  const area = (fondo: number, dir: 1 | -1, radio: number) => {
    const xIn = fondo + dir * radio;
    const sweep = dir === 1 ? 1 : 0;
    return `M${fondo} ${r(posteSup - radio)}A${radio} ${radio} 0 0 ${sweep} ${r(xIn)} ${r(posteSup)}L${r(xIn)} ${r(posteInf)}A${radio} ${radio} 0 0 ${sweep} ${fondo} ${r(posteInf + radio)}`;
  };

  const anchoFranja = largo / 10;
  const marcas = [0, largo]
    .flatMap((fondo) => {
      const dir = fondo === 0 ? 1 : -1;
      return marcasCorner.flatMap((d) => [
        `M${fondo} ${r(posteSup - d)}h${dir * 0.6}`,
        `M${fondo} ${r(posteInf + d)}h${dir * 0.6}`,
      ]);
    })
    .join("");
  const arcos = [0, largo]
    .map((fondo) => {
      const fuera = r(fondo === 0 ? -profundidadArco : largo + profundidadArco);
      return `M${fondo} ${r(posteSup)}H${fuera}V${r(posteInf)}H${fondo}`;
    })
    .join("");
  const punteada = `${r(grosor * 4)} ${r(grosor * 7)}`;

  return (
    <g aria-hidden="true">
      {/* Más allá de la zona de seguridad sigue el sintético, más oscuro: los encuadres ajustados pueden mostrarlo. */}
      <rect x={-30} y={-30} width={largo + 60} height={ancho + 60} fill="var(--turf-runoff)" />
      <rect x={-2.5} y={-2.5} width={largo + 5} height={ancho + 5} fill="var(--turf)" />
      {textura &&
        Array.from({ length: 5 }, (_, k) => k * 2 + 1).map((i) => (
          <rect key={i} x={r(i * anchoFranja)} y={-2.5} width={r(anchoFranja)} height={ancho + 5} fill="var(--turf-stripe)" />
        ))}
      {textura && <rect x={-30} y={-30} width={largo + 60} height={ancho + 60} fill="url(#pb-fibra)" />}

      <g fill="none" stroke="var(--chalk)" strokeWidth={grosor}>
        <rect x={0} y={0} width={largo} height={ancho} />
        <path d={`M${largo / 2} 0V${ancho}M${linea23} 0V${ancho}M${r(largo - linea23)} 0V${ancho}`} />
        <path d={area(0, 1, radioArea) + area(largo, -1, radioArea)} />
        <path d={area(0, 1, radioPunteada) + area(largo, -1, radioPunteada)} strokeDasharray={punteada} />
        <path d={marcas} />
        <path d={arcos} strokeWidth={grosor * 1.6} />
      </g>
      <circle cx={penal} cy={medio} r={grosor * 0.9} fill="var(--chalk)" />
      <circle cx={r(largo - penal)} cy={medio} r={grosor * 0.9} fill="var(--chalk)" />
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
