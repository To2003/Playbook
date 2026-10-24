"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { PizarraSVG } from "@/components/pizarra/PizarraSVG";
import { IconoBiblioteca, IconoClub, IconoFlecha, IconoMisEjercicios, IconoSeguir, Marca } from "@/components/iconos";
import { EJERCICIOS_BASE, ejercicioBase } from "@/data/biblioteca";
import { db } from "@/lib/db";
import { useAjustes } from "@/lib/estado/ajustes";
import { useBiblioteca, useSesionActual } from "@/lib/estado/sesiones";
import { minutosTotales } from "@/lib/motor/generar";
import { useHoy } from "@/lib/hooks/useHoy";
import { NOMBRE_ESPACIO, NOMBRE_INTENSIDAD, NOMBRE_NIVEL, hora } from "@/lib/nombres";
import { esPausa, type BloqueSesion } from "@/lib/tipos";

export default function Inicio() {
  const sesion = useSesionActual();
  const hoy = useHoy();
  const ajustes = useAjustes();
  const biblioteca = useBiblioteca();
  const borradores = useLiveQuery(() => db().ejercicios.where("estado").equals("borrador").count(), []) ?? 0;
  const propios = useLiveQuery(() => db().ejercicios.count(), []) ?? 0;

  const bloques = sesion ? sesion.items.filter((x): x is BloqueSesion => !esPausa(x)) : [];
  // La pizarra de portada: el juego aplicado, que es donde se ve el partido.
  const portada = bloques.find((b) => b.bloque === 4) ?? bloques[0];
  const ejercicioPortada = portada ? (biblioteca.find((e) => e.id === portada.ejercicioId) ?? ejercicioBase(portada.ejercicioId)) : undefined;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-4 pt-[max(env(safe-area-inset-top),12px)]">
      <header className="flex h-14 items-center justify-between">
        <span className="flex items-center gap-2">
          <Marca />
          <span className="marcador text-[1.75rem] leading-none" translate="no">Playbook</span>
        </span>
        <span className="text-label text-ink-muted">{hoy}</span>
      </header>

      <main className="flex flex-1 flex-col gap-6 pb-[calc(124px+env(safe-area-inset-bottom))] pt-2">
        <h1 className="sr-only">Inicio</h1>

        {sesion && ejercicioPortada ? (
          <section aria-labelledby="hoy">
            <Link href="/sesion" className="pressable block overflow-hidden rounded-card bg-surface">
              <PizarraSVG pizarra={ejercicioPortada.pizarra} aspecto={16 / 9} className="h-auto w-full" titulo={`Pizarra: ${ejercicioPortada.nombre}`} />
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <h2 id="hoy" className="text-title font-[650]">
                    Volver a la de hoy
                  </h2>
                  <p className="mt-1 text-label text-ink-muted">
                    {hora(sesion.fecha)} · {sesion.params.jugadores} jugadores + {sesion.params.arqueros} {sesion.params.arqueros === 1 ? "arquero" : "arqueros"} ·{" "}
                    {NOMBRE_NIVEL[sesion.params.nivel]} · {NOMBRE_INTENSIDAD[sesion.params.intensidad]}
                  </p>
                </div>
                <span className="marcador shrink-0 text-[2.5rem]">
                  {minutosTotales(sesion)}
                  <span className="text-title font-[650] text-ink-muted" style={{ fontVariationSettings: '"wdth" 100' }}>
                    {" "}
                    min
                  </span>
                </span>
              </div>
              {/* La sesión como tira de marcador: cada bloque ocupa lo que dura. */}
              <div className="flex gap-[3px] px-4 pb-4" aria-hidden="true">
                {sesion.items.map((b) => (
                  <span key={b.id} className={`h-2 rounded-[2px] ${esPausa(b) ? "bg-line" : "bg-ink-faint"}`} style={{ flexGrow: b.minutos }} />
                ))}
              </div>
            </Link>
          </section>
        ) : sesion === null ? (
          <section className="rounded-card bg-surface p-4" aria-labelledby="vacio">
            <h2 id="vacio" className="text-title font-[650]">
              Todavía no armaste ninguna
            </h2>
            <p className="mt-1 text-body text-ink-muted">Contá cuántos vinieron, elegí nivel e intensidad, y en tres toques tenés la sesión con sus pizarras.</p>
          </section>
        ) : (
          <div className="aspect-[16/12] rounded-card bg-surface" aria-busy="true" />
        )}

        <nav aria-label="Más cosas">
          <ul className="flex flex-col">
            {[
              { href: "/biblioteca", icono: IconoBiblioteca, titulo: "Biblioteca", dato: `${EJERCICIOS_BASE.length} ejercicios` },
              { href: "/mis-ejercicios", icono: IconoMisEjercicios, titulo: "Mis ejercicios", dato: borradores ? `${borradores} ${borradores === 1 ? "borrador" : "borradores"}` : `${propios}` },
              {
                href: "/mi-club",
                icono: IconoClub,
                titulo: "Mi club",
                dato: ajustes ? `${ajustes.duracion.completa} min · ${NOMBRE_ESPACIO[ajustes.espacio].toLowerCase()}` : "",
              },
            ].map(({ href, icono: Icono, titulo, dato }, i) => (
              <li key={href} className={i > 0 ? "border-t border-line" : undefined}>
                <Link href={href} className="pressable flex h-16 items-center gap-4 rounded-card px-1">
                  <Icono className="text-ink-muted" />
                  <span className="flex-1 text-body font-semibold">{titulo}</span>
                  <span className="text-label text-ink-faint">{dato}</span>
                  <IconoSeguir tam={20} className="text-ink-faint" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>

      <div className="fixed inset-x-0 bottom-0 bg-ground">
        <div className="mx-auto max-w-[480px] px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
          <Link href="/armar" className="pressable btn-primary flex h-24 items-center justify-between px-6">
            <span className="marcador text-[2.25rem] leading-none" style={{ fontVariationSettings: '"wdth" 70' }}>
              Arrancar entrenamiento
            </span>
            <IconoFlecha tam={32} />
          </Link>
        </div>
      </div>
    </div>
  );
}
