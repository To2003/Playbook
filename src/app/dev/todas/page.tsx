import { notFound } from "next/navigation";
import { PizarraSVG } from "@/components/pizarra/PizarraSVG";
import { BIBLIOTECA } from "@/data/biblioteca";

/** Todas las pizarras en paso final, para revisarlas de un vistazo (solo en desarrollo). */
export default function Todas() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="grid grid-cols-6 gap-2 p-2">
      {BIBLIOTECA.map((e, i) => (
        <figure key={e.id} className="overflow-hidden rounded-pitch bg-surface">
          <PizarraSVG pizarra={e.pizarra} aspecto={16 / 10} className="h-auto w-full" />
          <figcaption className="p-1 text-meta">
            {i + 1}. {e.nombre}
          </figcaption>
        </figure>
      ))}
    </main>
  );
}
