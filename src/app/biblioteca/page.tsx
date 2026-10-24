"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Barras } from "@/components/Barras";
import { Cabecera } from "@/components/Cabecera";
import { IconoMas, IconoMenos, IconoSeguir } from "@/components/iconos";
import { PizarraSVG } from "@/components/pizarra/PizarraSVG";
import { Segmentado } from "@/components/Segmentado";
import { useBiblioteca } from "@/lib/estado/sesiones";
import { filtrarEjercicios, type Filtros } from "@/lib/filtros";
import { NOMBRE_FASE, NOMBRE_FORMATO, NOMBRE_OBJETIVO } from "@/lib/nombres";
import type { Ejercicio, Fase, Nivel, Objetivo } from "@/lib/tipos";

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
                  <Fila e={e} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

function Fila({ e }: { e: Ejercicio }) {
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

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
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
