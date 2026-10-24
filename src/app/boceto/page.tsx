"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Cabecera } from "@/components/Cabecera";
import { Herramientas } from "@/components/editor/Herramientas";
import { Lienzo, type Herramienta } from "@/components/editor/Lienzo";
import { Paleta, nuevoElemento, type TipoPaleta } from "@/components/editor/Paleta";
import { IconoDeshacer } from "@/components/iconos";
import { idsLibres } from "@/lib/editor/ids";
import { useEditor } from "@/lib/editor/useEditor";
import { NOMBRE_FASE } from "@/lib/nombres";
import { VISTAS, orientacionDe } from "@/lib/pizarra/geometria";
import type { Fase } from "@/lib/tipos";

export default function Pagina() {
  return (
    <Suspense fallback={<main className="min-h-dvh" aria-busy="true" />}>
      <Boceto />
    </Suspense>
  );
}

/**
 * Boceto del celu (SPEC 7): un solo paso con flechas, nombre y fase. Se guarda siempre
 * como borrador en "Mis ejercicios" y se termina en el editor de la compu.
 */
function Boceto() {
  const id = useSearchParams().get("id");
  const router = useRouter();
  const ed = useEditor(id);
  const { ejercicio: e, despachar } = ed;
  const pz = e.pizarra;
  const [herramienta, setHerramienta] = useState<Herramienta>("mover");
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [trazoSel, setTrazoSel] = useState<number | null>(null);

  const agregar = (tipo: TipoPaleta) => {
    const el = nuevoElemento(tipo, pz.elementos);
    const c = VISTAS[pz.vista];
    const corrido = (pz.elementos.length % 6) * 2.5;
    despachar({ tipo: "agregar", elemento: el, en: { x: c.x + c.w / 2 - corrido, y: c.y + c.h / 2 + corrido } });
    setSeleccion([el.id]);
    setHerramienta("mover");
  };

  const borrar = () => {
    if (trazoSel !== null) {
      despachar({ tipo: "borrarTrazo", paso: 0, indice: trazoSel });
      setTrazoSel(null);
    } else if (seleccion.length) {
      despachar({ tipo: "borrar", ids: seleccion });
      setSeleccion([]);
    }
  };

  return (
    <div className="mx-auto flex h-dvh max-w-[560px] flex-col gap-3 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-[max(env(safe-area-inset-top),8px)]">
      <Cabecera volver="/mis-ejercicios" etiquetaVolver="Volver a mis ejercicios" alVolver={ed.confirmarSalida}>
        <button type="button" onClick={ed.deshacer} disabled={!ed.puedeDeshacer} aria-label="Deshacer" className="pressable grid size-12 place-items-center rounded-card disabled:opacity-35">
          <IconoDeshacer />
        </button>
      </Cabecera>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <label>
          <span className="sr-only">Nombre del ejercicio</span>
          <input
            value={e.nombre}
            onChange={(ev) => despachar({ tipo: "ficha", cambios: { nombre: ev.target.value } })}
            name="nombre"
            autoComplete="off"
            placeholder="¿Cómo se llama?"
            className="h-12 w-full rounded-card bg-raised px-3 text-[1.125rem] font-bold placeholder:font-normal placeholder:text-ink-faint"
          />
        </label>
        <label>
          <span className="sr-only">Fase</span>
          <select value={e.fase} onChange={(ev) => despachar({ tipo: "ficha", cambios: { fase: ev.target.value as Fase } })} className="h-12 max-w-[42vw] rounded-card bg-raised px-2 text-label font-semibold">
            {(Object.keys(NOMBRE_FASE) as Fase[]).map((f) => (
              <option key={f} value={f}>
                {NOMBRE_FASE[f]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-card bg-[var(--turf-runoff)]">
        {ed.cargado && (
          <Lienzo
            ejercicio={e}
            paso={0}
            orientacion={orientacionDe(pz.vista)}
            herramienta={herramienta}
            seleccion={seleccion}
            onSeleccion={setSeleccion}
            trazoSel={trazoSel}
            onTrazoSel={setTrazoSel}
            despachar={despachar}
            className="h-full w-full"
          />
        )}
        {(seleccion.length > 0 || trazoSel !== null) && (
          <div className="absolute right-2 top-2 flex gap-1">
            {seleccion.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const nuevos = idsLibres(seleccion, pz.elementos.map((x) => x.id));
                  despachar({ tipo: "duplicar", ids: seleccion, paso: 0, nuevosIds: nuevos });
                  setSeleccion(nuevos);
                }}
                className="pressable h-11 rounded-card bg-ground/85 px-3 text-label font-semibold"
              >
                Duplicar
              </button>
            )}
            <button type="button" onClick={borrar} className="pressable h-11 rounded-card bg-ground/85 px-3 text-label font-semibold text-danger">
              {trazoSel !== null ? "Borrar flecha" : "Borrar"}
            </button>
          </div>
        )}
      </div>

      <Paleta onAgregar={agregar} compacta />
      <div className="flex items-center justify-between gap-2">
        <Herramientas valor={herramienta} onCambio={setHerramienta} />
        <button
          type="button"
          onClick={async () => {
            await ed.guardar(true);
            router.push("/mis-ejercicios");
          }}
          className="pressable btn-primary h-12 flex-1 px-4"
        >
          Guardar
        </button>
      </div>
      <p className="-mt-1 text-meta text-ink-faint">Queda como borrador en Mis ejercicios. Lo terminás en la compu.</p>
    </div>
  );
}
