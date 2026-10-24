"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TarjetaBloque } from "@/components/flujo/TarjetaBloque";
import { BarraPasos } from "@/components/BarraPasos";
import { IconoAgua, IconoDeslizar, IconoVolver } from "@/components/iconos";
import { guardarSesion, historialReciente, useBiblioteca, useSesionActual } from "@/lib/estado/sesiones";
import { consumirRecienArmada } from "@/lib/estado/transicion";
import { Draggable, gsap, useGSAP } from "@/lib/gsap";
import { useMovimientoReducido } from "@/lib/hooks/useMovimientoReducido";
import { ajustarMinutos, dameOtro, minutosTotales, moverItem, type Relajar } from "@/lib/motor/generar";
import { NOMBRE_INTENSIDAD, NOMBRE_NIVEL } from "@/lib/nombres";
import type { Sesion } from "@/lib/tipos";
import { esPausa } from "@/lib/tipos";

export default function SesionGenerada() {
  const router = useRouter();
  const guardada = useSesionActual();
  const biblioteca = useBiblioteca();
  const reducido = useMovimientoReducido();
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [aviso, setAviso] = useState<{ itemId: string; motivo: string; sugerencias: { etiqueta: string; relajar: Relajar }[] } | null>(null);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const lista = useRef<HTMLOListElement>(null);
  const repartir = useRef(false);
  const sesionRef = useRef<Sesion | null>(null);

  // La sesión vive en IndexedDB; acá se edita una copia y cada cambio se guarda.
  useEffect(() => {
    if (guardada && guardada.id !== sesionRef.current?.id) {
      repartir.current = consumirRecienArmada(guardada.id);
      sesionRef.current = guardada;
      setSesion(guardada);
    }
  }, [guardada]);

  const actualizar = (s: Sesion) => {
    sesionRef.current = s;
    setSesion(s);
    void guardarSesion(s);
  };

  const moverPor = (idx: number, delta: number) => {
    const s = sesionRef.current;
    if (!s) return;
    const destino = Math.max(0, Math.min(s.items.length - 1, idx + delta));
    if (destino !== idx) actualizar(moverItem(s, idx, destino));
  };

  // Las cartas entran repartidas sobre la línea de tiempo (solo recién armada).
  useGSAP(
    () => {
      if (!sesion || !repartir.current || reducido || !lista.current) return;
      repartir.current = false;
      gsap.from(lista.current.querySelectorAll("[data-carta]"), {
        y: 36,
        rotation: (i: number) => (i % 2 ? 2.5 : -2.5),
        opacity: 0,
        duration: 0.42,
        ease: "power3.out",
        stagger: 0.06,
        clearProps: "transform,opacity",
      });
    },
    { dependencies: [sesion?.id, reducido], scope: lista },
  );

  // Reordenar arrastrando desde la manija.
  useGSAP(
    () => {
      if (!lista.current || !sesion) return;
      const filas = Array.from(lista.current.querySelectorAll<HTMLLIElement>("[data-fila]"));
      const ds = filas.flatMap((fila, idx) => {
        const manija = fila.querySelector<HTMLElement>("[data-manija]");
        if (!manija) return [];
        return Draggable.create(fila, {
          type: "y",
          trigger: manija,
          zIndexBoost: true,
          onPress() {
            gsap.to(fila, { scale: 1.02, boxShadow: "0 12px 24px -8px rgba(0,0,0,.6)", duration: 0.15, ease: "power2.out" });
          },
          onRelease() {
            const alto = fila.offsetHeight;
            const saltos = Math.round(this.y / (alto * 0.75));
            gsap.to(fila, { scale: 1, boxShadow: "none", y: 0, duration: 0.2, ease: "power2.out" });
            if (saltos) moverPor(idx, saltos);
          },
        });
      });
      return () => ds.forEach((d) => d.kill());
    },
    { dependencies: [sesion], scope: lista },
  );

  if (guardada === null) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center gap-4 px-4">
        <h1 className="titular">Todavía no armaste ninguna</h1>
        <p className="text-ink-muted">Contá cuántos vinieron y te la armo en un toque.</p>
        <Link href="/armar" className="pressable btn-primary flex h-16 items-center justify-center text-title">
          Arrancar entrenamiento
        </Link>
      </main>
    );
  }
  if (!sesion) return <main className="min-h-dvh" aria-busy="true" />;

  const { params, items } = sesion;
  const total = minutosTotales(sesion);
  const inicios = items.map((_, i) => items.slice(0, i).reduce((s, b) => s + b.minutos, 0));
  const porId = new Map(biblioteca.map((e) => [e.id, e]));

  async function otro(itemId: string, relajar?: Relajar): Promise<boolean> {
    const s = sesionRef.current;
    if (!s) return false;
    const historial = await historialReciente(s.id);
    const r = dameOtro(s, itemId, biblioteca, historial, relajar);
    if (!r.ok) {
      setAviso({ itemId, motivo: r.motivo, sugerencias: r.sugerencias });
      return false;
    }
    setAviso(null);
    actualizar(r.sesion);
    return true;
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col overflow-x-clip px-4 pt-[max(env(safe-area-inset-top),12px)]">
      <header className="flex h-14 items-center gap-3">
        <Link href="/armar/opciones" aria-label="Volver a ¿Qué armamos?" className="pressable -ml-3 grid size-12 place-items-center rounded-card">
          <IconoVolver />
        </Link>
        <BarraPasos actual={3} />
      </header>

      <main className="pb-[calc(104px+env(safe-area-inset-bottom))]">
        <div className="mt-1 flex items-end justify-between gap-4">
          <div>
            <h1 className="titular">Tu sesión</h1>
            <p className="mt-1 text-label text-ink-muted">
              {params.jugadores} + {params.arqueros} {params.arqueros === 1 ? "arquero" : "arqueros"} · {NOMBRE_NIVEL[params.nivel]} · {NOMBRE_INTENSIDAD[params.intensidad]}
            </p>
          </div>
          <p className="marcador text-[4.5rem]" aria-live="polite" aria-label={`${total} minutos en total`}>
            {total}
            <span className="ml-1 text-title font-[650] text-ink-muted" style={{ fontVariationSettings: '"wdth" 100' }}>
              min
            </span>
          </p>
        </div>
        <p className="mt-3 flex items-center gap-2 text-label text-ink-muted">
          <IconoDeslizar tam={18} /> Deslizá un bloque y te doy otro ejercicio.
        </p>

        <ol ref={lista} className="mt-4 flex flex-col">
          {items.map((item, i) => {
            if (esPausa(item)) {
              return (
                <li key={item.id} className="grid grid-cols-[44px_1fr] items-center gap-3 py-2">
                  <span className="marcador text-right text-[1.25rem] text-ink-faint">{inicios[i]}&#8242;</span>
                  <p data-carta className="flex h-10 items-center gap-2 text-label text-ink-muted">
                    <IconoAgua tam={18} /> Hidratación: dos minutos
                  </p>
                </li>
              );
            }
            const e = porId.get(item.ejercicioId);
            if (!e) return null;
            return (
              <li key={item.id} data-fila className="relative grid grid-cols-[44px_1fr] gap-3 rounded-card bg-ground py-1.5">
                <span className="marcador pt-4 text-right text-[1.5rem] text-ink-muted">{inicios[i]}&#8242;</span>
                <div data-carta>
                  <TarjetaBloque
                    bloque={item}
                    ejercicio={e}
                    tarea={item.tareaArqueroId ? porId.get(item.tareaArqueroId) : undefined}
                    onOtro={() => otro(item.id)}
                    onMinutos={(d) => actualizar(ajustarMinutos(sesion, item.id, d))}
                    onMover={(d) => moverPor(i, d)}
                  />
                  {aviso?.itemId === item.id && (
                    <div role="alert" className="mt-2 rounded-card bg-raised p-3">
                      <p className="text-body font-semibold">{aviso.motivo}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {aviso.sugerencias.map((s) => (
                          <button key={s.etiqueta} type="button" onClick={() => void otro(item.id, s.relajar)} className="pressable h-12 rounded-chip bg-ink px-3 text-label font-semibold text-ground">
                            {s.etiqueta}
                          </button>
                        ))}
                        <button type="button" onClick={() => setAviso(null)} className="pressable h-12 rounded-chip px-3 text-label font-semibold text-ink-muted">
                          Dejar este
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 bg-ground">
        <div className="mx-auto grid max-w-[480px] grid-cols-[1fr_1.6fr] gap-2 px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
          <button
            type="button"
            onClick={() => {
              actualizar({ ...sesion, guardada: true });
              setGuardadoOk(true);
            }}
            className="pressable pressable-raised btn-secondary h-16 text-body"
            aria-live="polite"
          >
            {guardadoOk || sesion.guardada ? "Guardada" : "Guardar para después"}
          </button>
          <button
            type="button"
            onClick={() => {
              // Pantalla completa en el mismo toque (el navegador lo exige); si no se puede, sigue igual.
              void document.documentElement.requestFullscreen?.().catch(() => {});
              router.push(`/cancha?id=${sesion.id}`);
            }}
            className="pressable btn-primary flex h-16 items-center justify-center text-title"
          >
            ¡A la cancha!
          </button>
        </div>
      </div>
    </div>
  );
}
