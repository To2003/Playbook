import { Cancha, DefsCancha, GROSOR_TIZA } from "@/components/pizarra/Cancha";
import { Ficha } from "@/components/pizarra/Ficha";
import { CANCHA, ROTACION_VERTICAL, VISTAS, cajaEnPantalla } from "@/lib/pizarra/geometria";
import { lugaresContador } from "@/lib/contador";

const LUGARES = lugaresContador();
// Se dibuja de más hacia la mitad de la cancha y se recorta abajo: así llena el alto que haya.
const vbMedia = cajaEnPantalla(VISTAS.media, "vertical");
const vb = { ...vbMedia, h: vbMedia.h + 30 };
const RADIO = 1.75;

/** Arqueros: el primero en el arco, el segundo esperando al costado del poste. */
const ARCO = [
  { x: CANCHA.largo - 0.9, y: CANCHA.ancho / 2 },
  { x: CANCHA.largo - 2.2, y: CANCHA.ancho / 2 + 6.5 },
];

/** Media cancha vertical con una ficha por presente. */
export function CanchaContador({ jugadores, arqueros }: { jugadores: number; arqueros: number }) {
  return (
    <svg
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      preserveAspectRatio="xMidYMin slice"
      className="absolute inset-0 block size-full"
      aria-hidden="true"
    >
      <DefsCancha />
      <g transform={ROTACION_VERTICAL}>
        <Cancha grosor={GROSOR_TIZA.media} />
      {LUGARES.slice(0, jugadores).map((lugar, i) => (
        <Ficha key={i} elemento={{ id: `j${i}`, tipo: "jugador", equipo: "A" }} en={lugar} radio={RADIO} girada />
      ))}
      {ARCO.slice(0, arqueros).map((lugar, i) => (
        <Ficha key={`k${i}`} elemento={{ id: `k${i}`, tipo: "arquero" }} en={lugar} radio={RADIO} girada />
      ))}
      </g>
    </svg>
  );
}
