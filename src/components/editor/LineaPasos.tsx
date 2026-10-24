"use client";

import type { Accion } from "@/lib/editor/estado";
import { MAX_PASOS } from "@/lib/editor/estado";
import type { Paso } from "@/lib/tipos";

/** Timeline de pasos: elegir, agregar, duplicar, reordenar, borrar y ajustar la duración de cada uno. */
export function LineaPasos({ pasos, actual, onElegir, despachar }: { pasos: Paso[]; actual: number; onElegir: (i: number) => void; despachar: (a: Accion) => void }) {
  const lleno = pasos.length >= MAX_PASOS;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-label font-semibold text-ink-muted">
          Pasos <span className="marcador text-[1.125rem] text-ink">{pasos.length}</span>/{MAX_PASOS}
        </h2>
        <div className="flex gap-1">
          <BotonPaso onClick={() => despachar({ tipo: "moverPaso", desde: actual, hasta: actual - 1 })} disabled={actual === 0} titulo="Mover el paso antes">
            ←
          </BotonPaso>
          <BotonPaso onClick={() => despachar({ tipo: "moverPaso", desde: actual, hasta: actual + 1 })} disabled={actual === pasos.length - 1} titulo="Mover el paso después">
            →
          </BotonPaso>
          <BotonPaso
            onClick={() => {
              despachar({ tipo: "duplicarPaso", paso: actual });
              onElegir(actual + 1);
            }}
            disabled={lleno}
            titulo="Duplicar el paso"
          >
            Duplicar
          </BotonPaso>
          <BotonPaso
            onClick={() => {
              despachar({ tipo: "borrarPaso", paso: actual });
              onElegir(Math.max(0, actual - 1));
            }}
            disabled={pasos.length <= 1}
            titulo="Borrar el paso"
          >
            Borrar
          </BotonPaso>
        </div>
      </div>
      <ol className="flex gap-2 overflow-x-auto pb-1">
        {pasos.map((p, i) => (
          <li key={i} className="shrink-0">
            <div className={`flex w-[156px] flex-col gap-1 rounded-card p-2 ${i === actual ? "bg-ink text-ground" : "bg-surface"}`}>
              <button type="button" onClick={() => onElegir(i)} aria-current={i === actual ? "step" : undefined} className="flex items-baseline justify-between text-left">
                <span className="marcador text-[1.5rem]">{i + 1}</span>
                <span className="text-meta">{p.trazos.length ? `${p.trazos.length} ${p.trazos.length === 1 ? "trazo" : "trazos"}` : i === pasos.length - 1 ? "final" : "sin trazos"}</span>
              </button>
              <label className="flex items-center justify-between text-meta">
                Dura
                <span className="flex items-center gap-1">
                  <button type="button" aria-label={`Paso ${i + 1}: menos tiempo`} onClick={() => despachar({ tipo: "duracionPaso", paso: i, ms: p.duracionMs - 200 })} className="grid size-7 place-items-center rounded-chip bg-raised text-ink">
                    −
                  </button>
                  <span className="num w-[3.2ch] text-center font-semibold">{(p.duracionMs / 1000).toFixed(1)}</span>
                  <button type="button" aria-label={`Paso ${i + 1}: más tiempo`} onClick={() => despachar({ tipo: "duracionPaso", paso: i, ms: p.duracionMs + 200 })} className="grid size-7 place-items-center rounded-chip bg-raised text-ink">
                    +
                  </button>
                  s
                </span>
              </label>
            </div>
          </li>
        ))}
        <li className="shrink-0">
          <button
            type="button"
            disabled={lleno}
            onClick={() => {
              despachar({ tipo: "agregarPaso", despuesDe: actual });
              onElegir(actual + 1);
            }}
            className="pressable grid h-full min-h-[76px] w-[96px] place-items-center rounded-card border-2 border-dashed border-line text-label font-semibold text-ink-muted disabled:opacity-40"
          >
            + Paso
          </button>
        </li>
      </ol>
    </div>
  );
}

function BotonPaso({ onClick, disabled, titulo, children }: { onClick: () => void; disabled?: boolean; titulo: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={titulo} aria-label={titulo} className="pressable h-10 min-w-10 rounded-card bg-raised px-3 text-label font-semibold disabled:opacity-35">
      {children}
    </button>
  );
}
