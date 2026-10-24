import { notFound } from "next/navigation";
import { PizarraSVG } from "@/components/pizarra/PizarraSVG";
import type { Pizarra as PizarraT } from "@/lib/tipos";

/** Muestrario de fichas para las pruebas de contraste (solo en desarrollo). */
const muestrario: PizarraT = {
  vista: "media",
  elementos: [
    { id: "a1", tipo: "jugador", equipo: "A", etiqueta: "1" },
    { id: "a2", tipo: "jugador", equipo: "A", etiqueta: "2" },
    { id: "b1", tipo: "jugador", equipo: "B", etiqueta: "1" },
    { id: "b2", tipo: "jugador", equipo: "B", etiqueta: "2" },
    { id: "c1", tipo: "jugador", equipo: "C", etiqueta: "C" },
    { id: "k1", tipo: "arquero", etiqueta: "A" },
    { id: "k2", tipo: "arquero", etiqueta: "B" },
    { id: "bo", tipo: "bocha" },
    { id: "co", tipo: "cono" },
  ],
  pasos: [
    {
      duracionMs: 1000,
      posiciones: {
        a1: { x: 70, y: 18 }, a2: { x: 76, y: 32 }, b1: { x: 74, y: 22 }, b2: { x: 80, y: 36 },
        c1: { x: 66, y: 27.5 }, k1: { x: 89.5, y: 27.5 }, k2: { x: 84, y: 24 }, bo: { x: 71.6, y: 19 }, co: { x: 62, y: 34 },
      },
      trazos: [],
    },
  ],
};

export default function Fichas() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto flex max-w-[480px] flex-col gap-4 p-4">
      <h1 className="titular">Fichas</h1>
      <div className="overflow-hidden rounded-pitch">
        <PizarraSVG pizarra={muestrario} aspecto={1.3} className="h-auto w-full" />
      </div>
      <div data-mode="cancha" className="overflow-hidden rounded-pitch bg-ground">
        <PizarraSVG pizarra={muestrario} altoContraste aspecto={1.3} className="h-auto w-full" />
      </div>
      <div data-mode="cancha" data-sol="true" className="overflow-hidden rounded-pitch bg-ground">
        <PizarraSVG pizarra={muestrario} altoContraste aspecto={1.3} className="h-auto w-full" />
      </div>
    </main>
  );
}
