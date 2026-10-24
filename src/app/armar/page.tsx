"use client";

import Link from "next/link";
import { useState } from "react";
import { CanchaContador } from "@/components/contador/CanchaContador";
import { IconoMas, IconoMenos, IconoVolver } from "@/components/iconos";
import { BarraPasos } from "@/components/BarraPasos";

const MIN = 4;
const MAX = 30;

export default function CuantosVinieron() {
  const [jugadores, setJugadores] = useState(14);
  const [arqueros, setArqueros] = useState(2);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-4 pt-[max(env(safe-area-inset-top),12px)]">
      <header className="flex h-14 items-center gap-3">
        <Link href="/" aria-label="Volver al inicio" className="pressable -ml-3 grid size-12 place-items-center rounded-card">
          <IconoVolver />
        </Link>
        <BarraPasos actual={1} />
      </header>

      <main className="flex flex-1 flex-col pb-[calc(104px+env(safe-area-inset-bottom))]">
        <h1 className="titular mt-1">¿Cuántos vinieron hoy?</h1>

        <section className="relative mt-4 min-h-[280px] flex-1 overflow-hidden rounded-pitch" aria-label="Jugadores de campo">
          <CanchaContador jugadores={jugadores} arqueros={arqueros} />
          <div className="pointer-events-none absolute inset-x-0 bottom-[12%] flex flex-col items-center">
            <output
              aria-live="polite"
              className="marcador text-[9rem] text-chalk"
              style={{ WebkitTextStroke: "10px var(--ground)", paintOrder: "stroke fill" }}
            >
              {jugadores}
            </output>
            <span
              className="mt-1 rounded-chip bg-ground px-2 py-0.5 text-label font-semibold text-ink"
            >
              jugadores de campo
            </span>
          </div>
        </section>

        <div className="mt-3 grid grid-cols-[72px_1fr_72px] items-center gap-3">
          <button
            type="button"
            aria-label="Uno menos"
            disabled={jugadores <= MIN}
            onClick={() => setJugadores((n) => Math.max(MIN, n - 1))}
            className="pressable pressable-raised btn-secondary grid size-[72px] place-items-center disabled:opacity-40"
          >
            <IconoMenos tam={32} />
          </button>
          <p className="text-center text-label text-ink-faint">
            de {MIN} a {MAX}
          </p>
          <button
            type="button"
            aria-label="Uno más"
            disabled={jugadores >= MAX}
            onClick={() => setJugadores((n) => Math.min(MAX, n + 1))}
            className="pressable pressable-raised btn-secondary grid size-[72px] place-items-center disabled:opacity-40"
          >
            <IconoMas tam={32} />
          </button>
        </div>

        <fieldset className="mt-5">
          <legend className="text-label font-semibold text-ink-muted">Arqueros</legend>
          <div className="mt-2 grid grid-cols-3 gap-1 rounded-card bg-surface p-1">
            {[0, 1, 2].map((n) => (
              <label
                key={n}
                className={`pressable marcador grid h-14 cursor-pointer place-items-center rounded-[6px] text-[2rem] ${
                  arqueros === n ? "bg-ink text-ground" : "text-ink-muted"
                }`}
              >
                <input type="radio" name="arqueros" value={n} checked={arqueros === n} onChange={() => setArqueros(n)} className="sr-only" />
                {n}
              </label>
            ))}
          </div>
        </fieldset>
      </main>

      <div className="fixed inset-x-0 bottom-0 bg-ground">
        <div className="mx-auto max-w-[480px] px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
          <Link href="/armar/opciones" className="pressable btn-primary flex h-16 items-center justify-center text-title">
            Seguir
          </Link>
        </div>
      </div>
    </div>
  );
}
