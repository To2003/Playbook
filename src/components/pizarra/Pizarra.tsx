import { Cancha, DefsCancha, GROSOR_TIZA } from "./Cancha";
import { Ficha } from "./Ficha";
import {
  type Orientacion,
  RADIO_FICHA,
  curva,
  encuadreAjustado,
  ondulada,
  proyector,
  puntaFlecha,
  recortarFinal,
  ruta,
  viewBox,
} from "@/lib/pizarra/geometria";
import type { Elemento, Pizarra as PizarraT, Punto, Trazo } from "@/lib/pizarra/types";

interface Props {
  pizarra: PizarraT;
  orientacion?: Orientacion;
  /** Modo cancha: tiza sobre negro, trazos más gruesos. */
  alto_contraste?: boolean;
  className?: string;
  titulo?: string;
  /** Si se pasa, la pizarra hace zoom a la jugada con esa proporción (ancho / alto). */
  aspecto?: number;
}

/**
 * Pizarra estática: las fichas en el paso final y todos los trazos del ejercicio.
 * Es también lo que se ve con prefers-reduced-motion.
 */
export function Pizarra({ pizarra, orientacion: forzada, alto_contraste = false, className, titulo, aspecto }: Props) {
  // La cancha completa va acostada; media y área van paradas, con el arco arriba, para que entren a lo ancho.
  const orientacion = forzada ?? (pizarra.vista === "completa" ? "horizontal" : "vertical");
  const p = proyector(orientacion);
  const rad = RADIO_FICHA[pizarra.vista];
  const grosor = GROSOR_TIZA[pizarra.vista] * (alto_contraste ? 1.4 : 1);
  const final = pizarra.pasos[pizarra.pasos.length - 1];
  const trazos = pizarra.pasos.flatMap((paso) => paso.trazos);

  // Las zonas van abajo de todo; la bocha arriba de los jugadores.
  const orden = (e: Elemento) => (e.tipo === "zona" ? 0 : e.tipo === "bocha" ? 3 : e.tipo === "jugador" || e.tipo === "arquero" ? 2 : 1);
  const elementos = pizarra.elementos.filter((e) => final.posiciones[e.id]).sort((a, b) => orden(a) - orden(b));
  const vb = aspecto ? encuadreAjustado(puntosDeLaJugada(pizarra, p), rad * 2.6, aspecto, 26) : viewBox(pizarra.vista, orientacion);

  return (
    <svg
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      className={className}
      role="img"
      aria-label={titulo ?? "Pizarra del ejercicio"}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
    >
      <DefsCancha />
      <Cancha orientacion={orientacion} grosor={grosor} textura={!alto_contraste} />
      {elementos
        .filter((e) => e.tipo === "zona")
        .map((e) => (
          <Ficha key={e.id} elemento={girar(e, orientacion)} en={p(final.posiciones[e.id])} radio={rad} />
        ))}
      <g fill="none" stroke="var(--chalk)" strokeLinecap="round" strokeLinejoin="round">
        {trazos.map((t) => (
          <TrazoSVG key={t.id} trazo={t} proyectar={p} rad={rad} grosor={grosor * 1.5} />
        ))}
      </g>
      {elementos
        .filter((e) => e.tipo !== "zona")
        .map((e) => (
          <Ficha key={e.id} elemento={girar(e, orientacion)} en={p(final.posiciones[e.id])} radio={rad} />
        ))}
    </svg>
  );
}

/** Todo lo que tiene que entrar en cuadro: fichas, zonas y recorridos de todos los pasos. */
function puntosDeLaJugada(pizarra: PizarraT, p: (q: Punto) => Punto): Punto[] {
  const zonas = new Map(pizarra.elementos.filter((e) => e.tipo === "zona").map((e) => [e.id, e]));
  const out: Punto[] = [];
  for (const paso of pizarra.pasos) {
    for (const [id, q] of Object.entries(paso.posiciones)) {
      const z = zonas.get(id);
      if (z) {
        const w = (z.ancho ?? 10) / 2;
        const h = (z.alto ?? 10) / 2;
        out.push(p({ x: q.x - w, y: q.y - h }), p({ x: q.x + w, y: q.y + h }));
      } else out.push(p(q));
    }
    for (const t of paso.trazos) out.push(...t.puntos.map(p));
  }
  return out;
}

function girar(e: Elemento, orientacion: Orientacion): Elemento {
  if (orientacion === "horizontal") return e;
  return { ...e, ancho: e.alto, alto: e.ancho, rotacion: e.rotacion !== undefined ? e.rotacion - 90 : e.rotacion };
}

/** Geometría ya proyectada de un trazo: el recorrido y su punta. */
export function geometriaTrazo(trazo: Trazo, proyectar: (q: Punto) => Punto, rad: number) {
  const pts = trazo.puntos.map(proyectar);
  const base = trazo.tipo === "conduccion" ? ondulada(pts, rad * 0.26, rad * 2.2) : curva(pts);
  // Arranca afuera de la ficha y termina antes de la que recibe.
  const sinInicio = recortarInicio(base, rad * 0.9);
  const recorrido = recortarFinal(sinInicio, rad * (trazo.tipo === "pase" || trazo.tipo === "tiro" ? 1.2 : 1.35));
  const tam = rad * (trazo.tipo === "tiro" ? 1.05 : 0.85);
  return { d: ruta(recorrido), punta: puntaFlecha(recorrido, tam) };
}

function recortarInicio(puntos: Punto[], metros: number): Punto[] {
  return recortarFinal(puntos.slice().reverse(), metros).reverse();
}

function TrazoSVG({ trazo, proyectar, rad, grosor }: { trazo: Trazo; proyectar: (q: Punto) => Punto; rad: number; grosor: number }) {
  const { d, punta } = geometriaTrazo(trazo, proyectar, rad);
  const ancho = trazo.tipo === "tiro" ? grosor * 2 : grosor;
  return (
    <g data-trazo={trazo.id}>
      <path d={d} strokeWidth={ancho} strokeDasharray={trazo.tipo === "pase" ? `${grosor * 2.2} ${grosor * 2.4}` : undefined} />
      <path d={punta} fill="var(--chalk)" stroke="none" />
    </g>
  );
}
