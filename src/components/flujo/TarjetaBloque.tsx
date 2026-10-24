"use client";

import Link from "next/link";
import { useRef } from "react";
import { PizarraAnimada } from "@/components/pizarra/PizarraAnimada";
import { IconoArquero, IconoArrastrar, IconoDeslizar, IconoDivision, IconoMas, IconoMenos, IconoSeguir } from "@/components/iconos";
import { NOMBRE_FASE } from "@/lib/nombres";
import { Draggable, gsap, useGSAP } from "@/lib/gsap";
import { useMovimientoReducido } from "@/lib/hooks/useMovimientoReducido";
import type { BloqueSesion, Ejercicio } from "@/lib/tipos";
import { vibrar } from "@/lib/vibrar";

interface Props {
  bloque: BloqueSesion;
  ejercicio: Ejercicio;
  tarea?: Ejercicio;
  /** Pide otro ejercicio; devuelve si cambió. */
  onOtro: () => Promise<boolean>;
  onMinutos: (delta: number) => void;
  onMover: (delta: number) => void;
}

const UMBRAL = 0.3; // fracción del ancho para que la carta salga
const VELOCIDAD = 0.9; // px/ms: un golpe rápido alcanza aunque no llegue al umbral

/**
 * Momento firma 3: la carta sigue al dedo; pasado el umbral sale y entra la nueva
 * (su pizarra se dibuja sola). Si no llega, vuelve con un resorte.
 */
export function TarjetaBloque({ bloque, ejercicio, tarea, onOtro, onMinutos, onMover }: Props) {
  const carta = useRef<HTMLElement>(null);
  const ocupado = useRef(false);
  const reducido = useMovimientoReducido();

  async function cambiar(dir: 1 | -1) {
    const el = carta.current;
    if (!el || ocupado.current) return;
    ocupado.current = true;
    const ancho = el.offsetWidth;
    vibrar(8);
    if (!reducido) await gsap.to(el, { x: dir * ancho * 1.1, rotation: dir * 5, opacity: 0, duration: 0.22, ease: "power2.out" });
    const cambio = await onOtro();
    if (reducido) {
      ocupado.current = false;
      return;
    }
    // Entra la nueva desde el lado contrario; si no hubo otra, vuelve la misma por donde se fue.
    const desde = cambio ? -dir : dir;
    gsap.set(el, { x: desde * ancho * 0.7, rotation: desde * 4, opacity: 0 });
    await gsap.to(el, { x: 0, rotation: 0, opacity: 1, duration: 0.5, ease: "back.out(1.4)" });
    ocupado.current = false;
  }

  useGSAP(
    () => {
      const el = carta.current;
      if (!el || reducido) return;
      let ultimo = { x: 0, t: 0 };
      let velocidad = 0;
      const [d] = Draggable.create(el, {
        type: "x",
        lockAxis: true,
        allowNativeTouchScrolling: true,
        minimumMovement: 10,
        zIndexBoost: false,
        onPress() {
          ultimo = { x: 0, t: performance.now() };
          velocidad = 0;
        },
        onDrag() {
          const ahora = performance.now();
          velocidad = (this.x - ultimo.x) / Math.max(1, ahora - ultimo.t);
          ultimo = { x: this.x, t: ahora };
          gsap.set(el, { rotation: this.x * 0.025 });
        },
        onRelease() {
          if (!this.isDragging && Math.abs(this.x) < 2) return;
          const ancho = el.offsetWidth;
          const dir: 1 | -1 = this.x >= 0 ? 1 : -1;
          if (Math.abs(this.x) > ancho * UMBRAL || Math.abs(velocidad) > VELOCIDAD) void cambiar(dir);
          else gsap.to(el, { x: 0, rotation: 0, duration: 0.55, ease: "elastic.out(1, 0.75)" });
        },
      });
      return () => d.kill();
    },
    { scope: carta, dependencies: [reducido] },
  );

  return (
    <article ref={carta} className="touch-pan-y overflow-hidden rounded-card bg-surface will-change-transform" aria-label={`${NOMBRE_FASE[bloque.fase]}: ${ejercicio.nombre}`}>
      <div className="flex items-center gap-2 pl-4 pr-1 pt-1">
        <p className="flex-1 text-label text-ink-muted">{NOMBRE_FASE[bloque.fase]}</p>
        <button
          type="button"
          data-manija
          aria-label={`Mover ${ejercicio.nombre}. Flechas arriba y abajo para reordenar`}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              onMover(-1);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              onMover(1);
            }
          }}
          className="grid size-12 cursor-grab touch-none place-items-center text-ink-faint active:cursor-grabbing"
        >
          <IconoArrastrar tam={20} />
        </button>
      </div>
      <h2 className="px-4 text-title font-[650]">{ejercicio.nombre}</h2>
      <div className="mt-3">
        <PizarraAnimada pizarra={ejercicio.pizarra} aspecto={16 / 9} titulo={`Pizarra: ${ejercicio.nombre}`} />
      </div>
      <dl className="flex flex-col gap-1.5 px-4 pt-3 text-label">
        <div className="flex items-start gap-2">
          <dt className="pt-px text-ink-faint">
            <IconoDivision tam={18} aria-label="División del grupo" />
          </dt>
          <dd className="num font-semibold">{bloque.division.texto}</dd>
        </div>
        {tarea && (
          <div className="flex items-start gap-2">
            <dt className="pt-px text-keeper">
              <IconoArquero tam={18} aria-label="Tarea de arqueros" />
            </dt>
            <dd className="text-ink-muted">Arqueros: {tarea.nombre.charAt(0).toLowerCase() + tarea.nombre.slice(1)}</dd>
          </div>
        )}
      </dl>
      <div className="mt-2 flex items-center gap-1 px-1 pb-1">
        <button type="button" aria-label="Un minuto menos" onClick={() => onMinutos(-1)} className="pressable grid size-12 place-items-center rounded-card text-ink-muted">
          <IconoMenos tam={20} />
        </button>
        <span className="marcador min-w-[3ch] text-center text-[2rem]" aria-label={`${bloque.minutos} minutos`}>
          {bloque.minutos}&#8242;
        </span>
        <button type="button" aria-label="Un minuto más" onClick={() => onMinutos(1)} className="pressable grid size-12 place-items-center rounded-card text-ink-muted">
          <IconoMas tam={20} />
        </button>
        <button type="button" onClick={() => void cambiar(1)} className="pressable ml-auto flex h-12 items-center gap-1 whitespace-nowrap rounded-card px-2 text-label font-semibold">
          <IconoDeslizar tam={16} className="hidden min-[400px]:block" /> Dame otro
        </button>
        <Link href={`/ficha?id=${encodeURIComponent(ejercicio.id)}`} className="pressable flex h-12 items-center gap-0.5 whitespace-nowrap rounded-card px-2 text-label font-semibold">
          Ficha <IconoSeguir tam={18} />
        </Link>
      </div>
    </article>
  );
}
