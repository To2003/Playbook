import Link from "next/link";
import { Barras } from "@/components/Barras";
import { PizarraSVG } from "@/components/pizarra/PizarraSVG";
import { NOMBRE_FORMATO } from "@/lib/nombres";
import type { Ejercicio } from "@/lib/tipos";

/** Fila de ejercicio con su pizarra quieta (lista en el celu, tarjeta en la compu). */
export function FilaEjercicio({ e }: { e: Ejercicio }) {
  return (
    <Link
      href={`/ficha?id=${encodeURIComponent(e.id)}`}
      className="pressable flex items-center gap-3 rounded-card py-3 lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-hidden lg:bg-surface lg:py-0"
    >
      <div className="w-28 shrink-0 overflow-hidden rounded-[4px] lg:w-full lg:rounded-none">
        <PizarraSVG pizarra={e.pizarra} aspecto={4 / 3} className="h-auto w-full" titulo={`Pizarra: ${e.nombre}`} />
      </div>
      <div className="min-w-0 flex-1 lg:p-4">
        <p className="text-body font-semibold leading-snug">{e.nombre}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-ink-muted">
          <span className="num">
            {e.jugadores.min === e.jugadores.max ? e.jugadores.min : `${e.jugadores.min}–${e.jugadores.max}`} {e.fase === "arquero" ? "arq." : "jug."}
          </span>
          <span aria-hidden="true">·</span>
          <span>{NOMBRE_FORMATO(e.formato)}</span>
          <Barras n={e.intensidad} tam={0.8} />
          {e.autor !== "base" && <span className="rounded-chip bg-raised px-1.5 py-0.5 font-semibold text-ink">{e.estado === "borrador" ? "Borrador" : "Mío"}</span>}
        </p>
      </div>
    </Link>
  );
}

export function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`pressable h-12 shrink-0 whitespace-nowrap rounded-chip px-3 text-label font-semibold ${activo ? "bg-ink text-ground" : "bg-raised text-ink"}`}
    >
      {children}
    </button>
  );
}
