"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { PizarraAnimada } from "@/components/pizarra/PizarraAnimada";
import { IconoAgua, IconoArquero, IconoCerrar, IconoLuna, IconoPausa, IconoSol } from "@/components/iconos";
import { type EstadoCancha, anterior, duracionMs, empezar, enPausa, mmss, pausar, reanudar, restante, siguiente } from "@/lib/cancha/cronometro";
import { guardarAjustes, useAjustes } from "@/lib/estado/ajustes";
import { useBiblioteca, useSesion } from "@/lib/estado/sesiones";
import { gsap } from "@/lib/gsap";
import { useWakeLock } from "@/lib/hooks/useWakeLock";
import { NOMBRE_FASE } from "@/lib/nombres";
import type { Ejercicio, Sesion } from "@/lib/tipos";
import { esPausa } from "@/lib/tipos";
import { vibrar } from "@/lib/vibrar";

export default function Pagina() {
  return (
    <Suspense fallback={<div data-mode="cancha" className="min-h-dvh bg-ground" />}>
      <ModoCancha />
    </Suspense>
  );
}

const claveProgreso = (id: string) => `pb-cancha-${id}`;

function ModoCancha() {
  const id = useSearchParams().get("id");
  const sesion = useSesion(id);
  const biblioteca = useBiblioteca();
  const ajustes = useAjustes();
  const sol = ajustes?.modoSol ?? false;

  if (sesion === null)
    return (
      <div data-mode="cancha" className="grid min-h-dvh place-items-center bg-ground p-6 text-center">
        <div>
          <p className="titular">No hay sesión para la cancha</p>
          <Link href="/armar" className="pressable btn-primary mt-6 flex h-16 items-center justify-center px-6 text-title">
            Arrancar entrenamiento
          </Link>
        </div>
      </div>
    );
  if (!sesion) return <div data-mode="cancha" className="min-h-dvh bg-ground" aria-busy="true" />;
  return <Cancha sesion={sesion} biblioteca={biblioteca} sol={sol} />;
}

function Cancha({ sesion, biblioteca, sol }: { sesion: Sesion; biblioteca: Ejercicio[]; sol: boolean }) {
  const router = useRouter();
  const { items } = sesion;
  const [estado, setEstado] = useState<EstadoCancha>(() => {
    // Si se volvió desde la ficha, se retoma donde estaba.
    try {
      const guardado = localStorage.getItem(claveProgreso(sesion.id));
      if (guardado) return JSON.parse(guardado) as EstadoCancha;
    } catch {
      // Sin almacenamiento: arranca de cero.
    }
    return empezar(items, Date.now());
  });
  const [ahora, setAhora] = useState(() => Date.now());
  const destello = useRef<HTMLDivElement>(null);
  const avisado = useRef<number | null>(null);

  useWakeLock(!estado.completa);

  useEffect(() => {
    try {
      localStorage.setItem(claveProgreso(sesion.id), JSON.stringify(estado));
    } catch {
      // Es solo una comodidad.
    }
  }, [estado, sesion.id]);

  // Un tick cada 250 ms alcanza: el tiempo sale del reloj, no de los ticks.
  useEffect(() => {
    const t = window.setInterval(() => setAhora(Date.now()), 250);
    return () => window.clearInterval(t);
  }, []);

  const queda = restante(estado, ahora);
  const tiempo = !estado.completa && queda === 0;

  // El silbato visual: destello corto y vibración al llegar a cero (una vez por ítem).
  useEffect(() => {
    if (!tiempo || avisado.current === estado.indice) return;
    avisado.current = estado.indice;
    vibrar([300, 120, 300]);
    if (destello.current) gsap.fromTo(destello.current, { opacity: 0.95 }, { opacity: 0, duration: 0.7, ease: "power2.out" });
  }, [tiempo, estado.indice]);

  const item = items[estado.indice];
  const bloquesTotales = items.filter((x) => !esPausa(x)).length;
  const numeroBloque = items.slice(0, estado.indice + 1).filter((x) => !esPausa(x)).length;
  const proximo = items.slice(estado.indice + 1).find((x) => !esPausa(x));
  const ej = (eid: string) => biblioteca.find((e) => e.id === eid);
  const proximoEj = proximo && !esPausa(proximo) ? ej(proximo.ejercicioId) : undefined;
  const avance = item ? 1 - queda / duracionMs(items, estado.indice) : 1;

  const salir = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    router.push("/sesion");
  };
  const alternarSol = () => void guardarAjustes({ modoSol: !sol });
  const pasar = () => {
    vibrar(10);
    setEstado((e) => siguiente(e, items, Date.now()));
  };

  if (estado.completa) {
    return (
      <div data-mode="cancha" data-sol={sol} className="grid min-h-dvh place-items-center bg-ground p-6">
        <div className="w-full max-w-[480px]">
          <p className="marcador text-[5rem]">¡Terminó!</p>
          <p className="mt-3 text-[1.5rem] font-semibold">Buen entrenamiento. Elongá y a la ducha.</p>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(claveProgreso(sesion.id));
              if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
              router.push("/");
            }}
            className="pressable btn-primary mt-8 h-[88px] w-full text-[1.5rem]"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const bloque = item && !esPausa(item) ? item : undefined;
  const ejercicio = bloque ? ej(bloque.ejercicioId) : undefined;
  const tarea = bloque?.tareaArqueroId ? ej(bloque.tareaArqueroId) : undefined;

  return (
    <div data-mode="cancha" data-sol={sol} className="min-h-dvh bg-ground text-ink">
      <div ref={destello} aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 bg-ink opacity-0" />
      <div className="mx-auto grid min-h-dvh max-w-[1100px] grid-rows-[auto_1fr_auto] px-4 pt-[max(env(safe-area-inset-top),8px)] landscape:max-lg:px-6">
        <header className="flex h-14 items-center justify-between gap-2">
          <p className="text-title font-semibold text-ink-muted">
            {bloque ? `Bloque ${numeroBloque} de ${bloquesTotales}` : "Pausa"}
          </p>
          <div className="-mr-3 flex items-center">
            <button type="button" aria-pressed={sol} onClick={alternarSol} className="pressable flex h-12 items-center gap-2 rounded-card px-3 text-label font-semibold">
              {sol ? <IconoLuna tam={22} /> : <IconoSol tam={22} />}
              {sol ? "Modo noche" : "Modo sol"}
            </button>
            <button type="button" aria-label="Salir del modo cancha" onClick={salir} className="pressable grid size-12 place-items-center rounded-card">
              <IconoCerrar tam={28} />
            </button>
          </div>
        </header>

        <main className="grid content-start gap-x-6 pb-[calc(112px+env(safe-area-inset-bottom))] landscape:max-lg:pb-[calc(84px+env(safe-area-inset-bottom))] landscape:max-lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] landscape:max-lg:items-start lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <h1 className="sr-only">Modo cancha</h1>
          <section aria-label="Tiempo que queda" className="landscape:max-lg:col-start-2 lg:col-start-2">
            {tiempo ? (
              <p className="marcador text-[6.5rem] leading-[0.8] landscape:max-lg:text-[4.5rem]" role="alert">
                ¡Tiempo!
              </p>
            ) : (
              <p className="marcador text-[6.5rem] leading-[0.8] landscape:max-lg:text-[4.5rem]" role="timer" aria-live="off">
                {mmss(queda)}
              </p>
            )}
            <div className="mt-3 h-3.5 overflow-hidden rounded-chip bg-raised">
              <div className="h-full origin-left bg-ink transition-transform duration-[250ms] ease-linear" style={{ transform: `scaleX(${Math.max(0, 1 - avance)})` }} />
            </div>
          </section>

          {bloque && ejercicio ? (
            <>
              <div className="landscape:max-lg:col-start-2 lg:col-start-2">
                <h2 className="mt-4 text-[1.5rem] font-bold leading-tight landscape:max-lg:mt-2 landscape:max-lg:text-[1.25rem]">{ejercicio.nombre}</h2>
                <p className="num mt-0.5 text-[1.125rem] font-semibold text-ink-muted">{bloque.division.texto}</p>
              </div>
              <div className="mt-3 overflow-hidden rounded-pitch border-2 border-raised landscape:max-lg:mt-0 landscape:max-lg:max-w-[calc((100dvh-150px)*1.7)] landscape:max-lg:col-start-1 landscape:max-lg:row-span-4 landscape:max-lg:row-start-1 lg:col-start-1 lg:row-span-4 lg:row-start-1">
                <PizarraAnimada pizarra={ejercicio.pizarra} altoContraste aspecto={1.7} soloVisible={false} titulo={`Pizarra: ${ejercicio.nombre}`} />
              </div>
              <div className="landscape:max-lg:col-start-2 lg:col-start-2">
                <ul className="mt-3 flex flex-col gap-2 text-[1.1875rem] font-medium leading-snug landscape:max-lg:gap-1 landscape:max-lg:text-[1rem]">
                  {ejercicio.puntosClave.map((p) => (
                    <li key={p} className="flex gap-3">
                      <span aria-hidden="true" className="mt-[0.45em] size-2.5 shrink-0 bg-ink" />
                      {p}
                    </li>
                  ))}
                </ul>
                {tarea && (
                  <p className="mt-3 flex items-start gap-3 text-[1.125rem] text-ink-muted">
                    <IconoArquero tam={22} className="mt-0.5 shrink-0 text-keeper" />
                    Arqueros: {tarea.nombre.charAt(0).toLowerCase() + tarea.nombre.slice(1)}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="mt-6 landscape:max-lg:col-start-2">
              <p className="flex items-center gap-3 text-[2rem] font-bold leading-tight">
                <IconoAgua tam={40} /> Hidratación: dos minutos
              </p>
              {proximoEj && (
                <p className="mt-4 text-[1.25rem] text-ink-muted">
                  Después: <span className="font-semibold text-ink">{proximoEj.nombre}</span> · {proximo && !esPausa(proximo) ? NOMBRE_FASE[proximo.fase] : ""}
                </p>
              )}
            </div>
          )}
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 bg-ground">
        <div className="mx-auto grid max-w-[1100px] grid-cols-[88px_1fr] gap-2 px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 landscape:max-lg:pb-[max(env(safe-area-inset-bottom),8px)] landscape:max-lg:pt-2">
          {tiempo ? (
            <button
              type="button"
              aria-label="Volver a empezar este bloque"
              onClick={() => setEstado((e) => empezar(items, Date.now(), e.indice))}
              className="pressable btn-secondary grid h-[88px] place-items-center text-label landscape:max-lg:h-16"
            >
              Repetir
            </button>
          ) : (
            <button
              type="button"
              aria-label={enPausa(estado) ? "Seguir" : "Pausar"}
              aria-pressed={enPausa(estado)}
              onClick={() => setEstado((e) => (enPausa(e) ? reanudar(e, Date.now()) : pausar(e, Date.now())))}
              className="pressable btn-secondary grid h-[88px] place-items-center landscape:max-lg:h-16"
            >
              {enPausa(estado) ? (
                <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
                </svg>
              ) : (
                <IconoPausa tam={36} />
              )}
            </button>
          )}
          <button type="button" onClick={pasar} className="pressable btn-primary h-[88px] px-4 text-left text-[1.5rem] leading-tight landscape:max-lg:h-16">
            {estado.indice >= items.length - 1 ? "Terminar" : tiempo ? "Siguiente" : "Siguiente bloque"}
            {tiempo && items[estado.indice + 1] && (
              <span className="block truncate text-label font-semibold">
                {esPausa(items[estado.indice + 1]) ? "Hidratación: dos minutos" : ej((items[estado.indice + 1] as { ejercicioId: string }).ejercicioId)?.nombre}
              </span>
            )}
          </button>
        </div>
        {/* Atrás, discreto: para corregir un toque de más. */}
        {estado.indice > 0 && (
          <button
            type="button"
            onClick={() => setEstado((e) => anterior(e, items, Date.now()))}
            className="sr-only focus:not-sr-only focus:absolute focus:bottom-28 focus:left-4 focus:rounded-card focus:bg-raised focus:p-3"
          >
            Bloque anterior
          </button>
        )}
      </div>
    </div>
  );
}
