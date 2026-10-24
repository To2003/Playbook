"use client";

import Link from "next/link";
import { useState } from "react";
import { PizarraSVG } from "@/components/pizarra/PizarraSVG";
import { IconoArquero, IconoCerrar, IconoLuna, IconoPausa, IconoSol } from "@/components/iconos";
import { type BloqueMaqueta, sesionMaqueta } from "@/data/maqueta";

export default function ModoCancha() {
  const [sol, setSol] = useState(false);
  const bloques = sesionMaqueta.items.filter((i): i is BloqueMaqueta => !("pausa" in i));
  const indice = 2;
  const bloque = bloques[indice];
  const restante = 7 * 60 + 42;
  const avance = 1 - restante / (bloque.minutos * 60);
  const mm = String(Math.floor(restante / 60)).padStart(2, "0");
  const ss = String(restante % 60).padStart(2, "0");

  return (
    <div data-mode="cancha" data-sol={sol} className="min-h-dvh bg-ground text-ink">
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-4 pt-[max(env(safe-area-inset-top),8px)]">
        <header className="flex h-14 items-center justify-between">
          <p className="text-title font-semibold text-ink-muted">
            Bloque {indice + 1} de {bloques.length}
          </p>
          <div className="-mr-3 flex items-center">
            <button
              type="button"
              aria-pressed={sol}
              onClick={() => setSol((s) => !s)}
              className="pressable flex h-12 items-center gap-2 rounded-card px-3 text-label font-semibold"
            >
              {sol ? <IconoLuna tam={22} /> : <IconoSol tam={22} />}
              {sol ? "Modo noche" : "Modo sol"}
            </button>
            <Link href="/sesion" aria-label="Salir del modo cancha" className="pressable grid size-12 place-items-center rounded-card">
              <IconoCerrar tam={28} />
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col pb-[calc(112px+env(safe-area-inset-bottom))]">
          <h1 className="sr-only">Modo cancha</h1>
          <section aria-label="Tiempo que queda del bloque">
            <p className="marcador text-[6.5rem] leading-[0.8]" role="timer">
              {mm}:{ss}
            </p>
            <div className="mt-3 h-3.5 overflow-hidden rounded-chip bg-raised">
              <div className="h-full origin-left bg-ink" style={{ transform: `scaleX(${1 - avance})` }} />
            </div>
          </section>

          <h2 className="mt-4 text-[1.5rem] font-bold leading-tight">{bloque.ejercicio}</h2>
          <p className="num mt-0.5 text-[1.125rem] font-semibold text-ink-muted">{bloque.division}</p>

          <div className="mt-3 overflow-hidden rounded-pitch border-2 border-raised">
            <PizarraSVG pizarra={bloque.pizarra} altoContraste aspecto={1.7} className="h-auto w-full" titulo={`Pizarra: ${bloque.ejercicio}`} />
          </div>

          <ul className="mt-3 flex flex-col gap-2 text-[1.1875rem] font-medium leading-snug">
            {bloque.puntosClave.map((p) => (
              <li key={p} className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.45em] size-2.5 shrink-0 bg-ink" />
                {p}
              </li>
            ))}
          </ul>
          {bloque.arqueros && (
            <p className="mt-3 flex items-center gap-3 text-[1.125rem] text-ink-muted">
              <IconoArquero tam={22} className="shrink-0 text-keeper" />
              {bloque.arqueros.replace("Arqueros: ", "")}
            </p>
          )}
        </main>

        <div className="fixed inset-x-0 bottom-0 bg-ground">
          <div className="mx-auto grid max-w-[480px] grid-cols-[88px_1fr] gap-2 px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
            <button type="button" aria-label="Pausar" className="pressable btn-secondary grid h-[88px] place-items-center">
              <IconoPausa tam={36} />
            </button>
            <button type="button" className="pressable btn-primary h-[88px] text-[1.5rem]">
              Siguiente bloque
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
