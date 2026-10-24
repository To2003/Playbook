"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BarraPasos } from "@/components/BarraPasos";
import { CanchaContador } from "@/components/contador/CanchaContador";
import { IconoMas, IconoMenos, IconoVolver } from "@/components/iconos";
import { Segmentado } from "@/components/Segmentado";
import { cambiarArmado, cargarArmado, leerArmado, useArmado } from "@/lib/estado/armado";
import { useRepetir } from "@/lib/hooks/useRepetir";
import { vibrar } from "@/lib/vibrar";

const MIN = 4;
const MAX = 30;

function sumar(delta: number) {
  const n = Math.max(MIN, Math.min(MAX, leerArmado().jugadores + delta));
  if (n !== leerArmado().jugadores) vibrar(6);
  cambiarArmado({ jugadores: n });
}

export default function CuantosVinieron() {
  const { jugadores, arqueros } = useArmado();
  const menos = useRepetir(() => sumar(-1));
  const mas = useRepetir(() => sumar(1));

  useEffect(() => {
    void cargarArmado();
  }, []);

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
              aria-label={`${jugadores} jugadores de campo`}
              className="marcador text-[9rem] text-chalk"
              style={{ WebkitTextStroke: "10px var(--ground)", paintOrder: "stroke fill" }}
            >
              {jugadores}
            </output>
            <span className="mt-1 rounded-chip bg-ground px-2 py-0.5 text-label font-semibold text-ink">jugadores de campo</span>
          </div>
        </section>

        <div className="mt-3 grid grid-cols-[72px_1fr_72px] items-center gap-3">
          <button
            type="button"
            aria-label="Uno menos"
            disabled={jugadores <= MIN}
            {...menos}
            className="pressable pressable-raised btn-secondary grid size-[72px] touch-none select-none place-items-center disabled:opacity-40"
          >
            <IconoMenos tam={32} />
          </button>
          <p className="text-center text-label text-ink-faint">
            de {MIN} a {MAX}
            <br />
            mantené para ir más rápido
          </p>
          <button
            type="button"
            aria-label="Uno más"
            disabled={jugadores >= MAX}
            {...mas}
            className="pressable pressable-raised btn-secondary grid size-[72px] touch-none select-none place-items-center disabled:opacity-40"
          >
            <IconoMas tam={32} />
          </button>
        </div>

        <div className="mt-5">
          <Segmentado<0 | 1 | 2>
            leyenda="Arqueros"
            nombre="arqueros"
            marcador
            valor={arqueros}
            onCambio={(a) => {
              vibrar(6);
              cambiarArmado({ arqueros: a });
            }}
            opciones={[0, 1, 2].map((n) => ({ valor: n as 0 | 1 | 2, etiqueta: n, nombre: `${n} arqueros` }))}
          />
        </div>
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
