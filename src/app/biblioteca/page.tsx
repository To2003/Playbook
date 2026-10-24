"use client";

import { useMemo, useState } from "react";
import { Cabecera } from "@/components/Cabecera";
import { IconoMas, IconoMenos, IconoSeguir } from "@/components/iconos";
import { Chip, FilaEjercicio } from "@/components/biblioteca/FilaEjercicio";
import { Segmentado } from "@/components/Segmentado";
import { useBiblioteca } from "@/lib/estado/sesiones";
import { filtrarEjercicios, type Filtros } from "@/lib/filtros";
import { NOMBRE_FASE, NOMBRE_OBJETIVO } from "@/lib/nombres";
import type { Fase, Nivel, Objetivo } from "@/lib/tipos";

const FASES: [Fase, string][] = [
  ["calor_sin_bocha", "Calor sin bocha"],
  ["calor_con_bocha", "Calor con bocha"],
  ["principal", "Principal"],
  ["aplicado", "Aplicado"],
  ["vuelta_calma", "Calma"],
  ["arquero", "Arqueros"],
];

export default function Biblioteca() {
  const todos = useBiblioteca();
  const [f, setF] = useState<Filtros>({});
  const cambiar = (c: Partial<Filtros>) => setF((x) => ({ ...x, ...c }));
  const resultado = useMemo(() => filtrarEjercicios(todos, f), [todos, f]);
  const porFase = FASES.map(([fase]) => [fase, resultado.filter((e) => e.fase === fase)] as const).filter(([, l]) => l.length);
  const activos = [f.nivel, f.objetivo, f.jugadores, f.soloFavoritos].filter(Boolean).length;

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] px-4 pb-16 pt-[max(env(safe-area-inset-top),12px)] lg:max-w-[1200px] lg:px-8">
      <Cabecera />
      <h1 className="titular mt-1">Biblioteca</h1>
      <p className="mt-1 text-label text-ink-muted">
        {resultado.length} de {todos.length} ejercicios · todos andan sin señal
      </p>

      <div className="sticky top-0 z-10 -mx-4 mt-4 bg-ground px-4 pb-3 pt-2 lg:-mx-8 lg:px-8">
        <label className="sr-only" htmlFor="buscar">
          Buscar
        </label>
        <input
          id="buscar"
          type="search"
          inputMode="search"
          placeholder="Buscá: rondo, flick, salida…"
          value={f.texto ?? ""}
          onChange={(e) => cambiar({ texto: e.target.value })}
          className="h-12 w-full rounded-card bg-surface px-4 text-body text-ink placeholder:text-ink-faint focus-visible:outline-2"
        />
        <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0" role="group" aria-label="Fase">
          <Chip activo={!f.fase} onClick={() => cambiar({ fase: undefined })}>
            Todas
          </Chip>
          {FASES.map(([v, t]) => (
            <Chip key={v} activo={f.fase === v} onClick={() => cambiar({ fase: f.fase === v ? undefined : v })}>
              {t}
            </Chip>
          ))}
        </div>
        <details className="group mt-2">
          <summary className="flex h-12 cursor-pointer list-none items-center gap-2 text-label font-semibold [&::-webkit-details-marker]:hidden">
            Más filtros{activos ? ` (${activos})` : ""}
            <IconoSeguir tam={18} className="text-ink-faint transition-transform duration-200 ease-[var(--ease-out)] group-open:rotate-90 motion-reduce:transition-none" />
          </summary>
          <div className="flex flex-col gap-4 pb-2 lg:max-w-[720px]">
            <Segmentado<Nivel | "todos">
              leyenda="Nivel"
              nombre="nivel"
              alto="md"
              valor={f.nivel ?? "todos"}
              onCambio={(v) => cambiar({ nivel: v === "todos" ? undefined : v })}
              opciones={[
                { valor: "todos", etiqueta: "Todos" },
                { valor: "inicial", etiqueta: "Inicial" },
                { valor: "intermedio", etiqueta: "Intermedio" },
                { valor: "avanzado", etiqueta: "Avanzado" },
              ]}
            />
            <fieldset>
              <legend className="text-label font-semibold text-ink-muted">Para cuántos de campo</legend>
              <div className="mt-2 flex items-center gap-2">
                <button type="button" aria-label="Menos jugadores" onClick={() => cambiar({ jugadores: Math.max(4, (f.jugadores ?? 14) - 1) })} className="pressable btn-secondary grid size-12 place-items-center">
                  <IconoMenos tam={20} />
                </button>
                <span className="marcador min-w-[3ch] text-center text-[2rem]">{f.jugadores ?? "—"}</span>
                <button type="button" aria-label="Más jugadores" onClick={() => cambiar({ jugadores: Math.min(30, (f.jugadores ?? 13) + 1) })} className="pressable btn-secondary grid size-12 place-items-center">
                  <IconoMas tam={20} />
                </button>
                {f.jugadores && (
                  <button type="button" onClick={() => cambiar({ jugadores: undefined })} className="pressable h-12 rounded-card px-3 text-label font-semibold text-ink-muted">
                    Cualquier cantidad
                  </button>
                )}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-label font-semibold text-ink-muted">Objetivo</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Object.entries(NOMBRE_OBJETIVO) as [Objetivo, string][]).map(([v, t]) => (
                  <Chip key={v} activo={f.objetivo === v} onClick={() => cambiar({ objetivo: f.objetivo === v ? undefined : v })}>
                    {t}
                  </Chip>
                ))}
              </div>
            </fieldset>
            <Chip activo={!!f.soloFavoritos} onClick={() => cambiar({ soloFavoritos: !f.soloFavoritos })}>
              Solo mis favoritos
            </Chip>
          </div>
        </details>
      </div>

      {porFase.length === 0 ? (
        <div className="mt-8 rounded-card bg-surface p-4">
          <p className="text-title font-[650]">Con esos filtros no hay nada</p>
          <p className="mt-1 text-ink-muted">Probá sacando alguno, o buscá con otra palabra.</p>
          <button type="button" onClick={() => setF({})} className="pressable btn-secondary mt-3 h-12 px-4">
            Sacar los filtros
          </button>
        </div>
      ) : (
        porFase.map(([fase, lista]) => (
          <section key={fase} className="mt-6" aria-labelledby={`f-${fase}`}>
            <h2 id={`f-${fase}`} className="flex items-baseline gap-2 text-title font-[650]">
              {NOMBRE_FASE[fase]} <span className="marcador text-[1.25rem] text-ink-faint">{lista.length}</span>
            </h2>
            <ul className="mt-2 flex flex-col lg:grid lg:grid-cols-3 lg:gap-4">
              {lista.map((e) => (
                <li key={e.id} className="border-t border-line first:border-t-0 lg:border-t-0">
                  <FilaEjercicio e={e} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
