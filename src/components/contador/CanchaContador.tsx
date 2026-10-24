"use client";

import { useRef } from "react";
import { Cancha, DefsCancha, GROSOR_TIZA } from "@/components/pizarra/Cancha";
import { Ficha } from "@/components/pizarra/Ficha";
import { lugaresContador } from "@/lib/contador";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMovimientoReducido } from "@/lib/hooks/useMovimientoReducido";
import { CANCHA, ROTACION_VERTICAL, VISTAS, cajaEnPantalla } from "@/lib/pizarra/geometria";

const LUGARES = lugaresContador();
// Se dibuja de más hacia la mitad de la cancha y se recorta abajo: así llena el alto que haya.
const vbMedia = cajaEnPantalla(VISTAS.media, "vertical");
const vb = { ...vbMedia, h: vbMedia.h + 30 };
const RADIO = 1.75;

/** Arqueros: el primero en el arco, el segundo esperando al costado del poste. */
export const LUGARES_ARCO = [
  { x: CANCHA.largo - 0.9, y: CANCHA.ancho / 2 },
  { x: CANCHA.largo - 2.2, y: CANCHA.ancho / 2 + 6.5 },
];

/**
 * Momento firma 1: media cancha con una ficha por presente.
 * Al sumar, la ficha cae sobre la cancha (vista desde arriba: baja de escala) y rebota;
 * al restar, se achica y se va. Cada toque interrumpe al anterior sin trabarse.
 */
export function CanchaContador({ jugadores, arqueros }: { jugadores: number; arqueros: number }) {
  const svg = useRef<SVGSVGElement>(null);
  const antes = useRef<{ j: number; a: number } | null>(null);
  const reducido = useMovimientoReducido();

  useGSAP(
    () => {
      const raiz = svg.current;
      if (!raiz) return;
      const fichas = (sel: string) => Array.from(raiz.querySelectorAll<SVGGElement>(sel));
      const previo = antes.current;
      antes.current = { j: jugadores, a: arqueros };

      const aplicar = (lista: SVGGElement[], visibles: number, antesVisibles: number | undefined) => {
        lista.forEach((el, i) => {
          const ve = i < visibles;
          if (antesVisibles === undefined || reducido) {
            gsap.set(el, { opacity: ve ? 1 : 0, scale: 1, transformOrigin: "50% 50%" });
            return;
          }
          const veia = i < antesVisibles;
          if (ve && !veia) {
            // Cae: de grande (cerca de la cámara) a su tamaño, con rebote de bocha contra el piso.
            gsap.fromTo(el, { opacity: 0, scale: 1.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: "bounce.out", transformOrigin: "50% 50%", overwrite: true });
          } else if (!ve && veia) {
            gsap.to(el, { opacity: 0, scale: 0.55, duration: 0.18, ease: "power2.out", transformOrigin: "50% 50%", overwrite: true });
          }
        });
      };
      aplicar(fichas("[data-contador='j']"), jugadores, previo?.j);
      aplicar(fichas("[data-contador='k']"), arqueros, previo?.a);
    },
    { scope: svg, dependencies: [jugadores, arqueros, reducido] },
  );

  return (
    <svg ref={svg} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} preserveAspectRatio="xMidYMin slice" className="absolute inset-0 block size-full" aria-hidden="true">
      <DefsCancha />
      <g transform={ROTACION_VERTICAL}>
        <Cancha grosor={GROSOR_TIZA.media} />
        {LUGARES.map((lugar, i) => (
          <g key={i} data-contador="j" style={{ opacity: i < jugadores ? 1 : 0 }}>
            <Ficha elemento={{ id: `j${i}`, tipo: "jugador", equipo: "A" }} en={lugar} radio={RADIO} girada />
          </g>
        ))}
        {LUGARES_ARCO.map((lugar, i) => (
          <g key={`k${i}`} data-contador="k" style={{ opacity: i < arqueros ? 1 : 0 }}>
            <Ficha elemento={{ id: `k${i}`, tipo: "arquero" }} en={lugar} radio={RADIO} girada />
          </g>
        ))}
      </g>
    </svg>
  );
}
