"use client";

import { memo, useEffect, useLayoutEffect, useRef } from "react";
import { Cancha, DefsCancha, GROSOR_TIZA } from "@/components/pizarra/Cancha";
import { LUGARES_ARCO } from "@/components/contador/CanchaContador";
import { lugaresContador } from "@/lib/contador";
import { Flip, gsap } from "@/lib/gsap";
import { ROTACION_VERTICAL, VISTAS, cajaEnPantalla, rotar } from "@/lib/pizarra/geometria";
import type { Division, Formato } from "@/lib/tipos";

const LUGARES = lugaresContador();
const vbMedia = cajaEnPantalla(VISTAS.media, "vertical");
const VB = { ...vbMedia, h: vbMedia.h + 30 };
const TAM = 0.06; // diámetro de ficha, en fracción del ancho

type Color = "A" | "B" | "C";
interface Lugar {
  x: number;
  y: number;
  color: Color;
}

/** Posición en el contador (pantalla 1), en fracción del contenedor. */
function enContador(i: number): { x: number; y: number } {
  const q = rotar(LUGARES[i], "vertical");
  return { x: (q.x - VB.x) / VB.w, y: (q.y - VB.y) / VB.h };
}

/** Grupos armados: cada parte es un racimo; los comodines y los que rotan, rombos blancos. */
function enDivision(n: number, d: Division, formato: Formato, ancho: number, alto: number): Lugar[] {
  const out: Lugar[] = [];
  const paso = ancho * 0.085;
  const racimo = (cant: number, cx: number, cy: number, color: Color | ((k: number) => Color), cols = 3) => {
    const filas = Math.ceil(cant / cols);
    for (let k = 0; k < cant; k++) {
      const f = Math.floor(k / cols);
      const c = k % cols;
      const enFila = Math.min(cols, cant - f * cols);
      out.push({ x: (cx + (c - (enFila - 1) / 2) * paso) / ancho, y: (cy + (f - (filas - 1) / 2) * paso) / alto, color: typeof color === "function" ? color(k) : color });
    }
  };
  const zonaY = alto * 0.42;
  if (formato.tipo === "individual") {
    racimo(n, ancho / 2, zonaY, "A", 6);
    return out;
  }
  const partes = d.partes;
  if (partes.length === 2 && formato.tipo === "dos_equipos") {
    racimo(partes[0], ancho * 0.26, zonaY, "A", 3);
    racimo(partes[1], ancho * 0.74, zonaY, "B", 3);
  } else {
    const cols = partes.length <= 2 ? partes.length : partes.length <= 6 ? 2 : 3;
    const filas = Math.ceil(partes.length / cols);
    partes.forEach((cant, i) => {
      const c = i % cols;
      const f = Math.floor(i / cols);
      // En superioridad, cada célula muestra a los que atacan (lima) contra los que defienden (coral).
      const color = formato.tipo === "superioridad" ? (k: number): Color => (k < formato.atacan ? "A" : "B") : i % 2 ? "B" : "A";
      racimo(cant, ancho * ((c + 0.5) / cols), alto * 0.16 + ((alto * 0.56) / filas) * (f + 0.5), color, cant > 4 ? 3 : 2);
    });
  }
  // Comodines entre los dos equipos; los que rotan, abajo esperando.
  racimo(d.comodines, ancho / 2, zonaY, "C", 1);
  racimo(d.rotan, ancho / 2, alto * 0.84, "C", 4);
  return out;
}

interface Props {
  jugadores: number;
  arqueros: number;
  division: Division;
  formato: Formato;
  ejercicio: string;
  onFin: () => void;
}

/**
 * Momento firma 2: las fichas del contador se separan en equipos y comodín (Flip).
 * Se ve la división antes de leerla; después pasa a la sesión. Un toque lo saltea.
 * Las fichas se mueven en el DOM, no por React: Flip mide antes y después y anima la diferencia.
 */
export function DivisionFlip({ jugadores, arqueros, division, formato, ejercicio, onFin }: Props) {
  const caja = useRef<HTMLDivElement>(null);
  const texto = useRef<HTMLDivElement>(null);
  const fin = useRef(onFin);
  useEffect(() => {
    fin.current = onFin;
  }, [onFin]);

  useLayoutEffect(() => {
    const el = caja.current;
    if (!el) return;
    const fichas = Array.from(el.querySelectorAll<HTMLElement>("[data-flip-id]"));
    const { width, height } = el.getBoundingClientRect();
    const destino = enDivision(jugadores, division, formato, width, height);
    let flip: gsap.core.Timeline | undefined;
    const t = window.setTimeout(() => {
      const estado = Flip.getState(fichas);
      fichas.forEach((f, i) => {
        f.style.left = `${destino[i].x * 100}%`;
        f.style.top = `${destino[i].y * 100}%`;
        f.dataset.color = destino[i].color;
      });
      flip = Flip.from(estado, { duration: 0.65, ease: "power2.inOut", stagger: 0.012 });
      gsap.fromTo(texto.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out", delay: 0.55 });
    }, 160);
    const salir = window.setTimeout(() => fin.current(), 160 + 650 + 900);
    // Se saltea tocando la pantalla o con Enter, Espacio o Escape.
    const tecla = (ev: KeyboardEvent) => ["Enter", " ", "Escape"].includes(ev.key) && fin.current();
    window.addEventListener("keydown", tecla);
    return () => {
      window.removeEventListener("keydown", tecla);
      window.clearTimeout(t);
      window.clearTimeout(salir);
      flip?.kill();
    };
  }, [jugadores, division, formato]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ground px-4 pt-[max(env(safe-area-inset-top),12px)]" role="status" aria-live="polite" onClick={() => fin.current()}>
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
        <p className="titular mt-14">Armando la sesión…</p>
        <div ref={caja} className="relative mt-4 overflow-hidden rounded-pitch" style={{ aspectRatio: `${VB.w} / ${VB.h}`, maxHeight: "60dvh" }}>
          <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} preserveAspectRatio="xMidYMin slice" className="absolute inset-0 size-full" aria-hidden="true">
            <DefsCancha />
            <g transform={ROTACION_VERTICAL}>
              <Cancha grosor={GROSOR_TIZA.media} />
            </g>
          </svg>
          <Fichas jugadores={jugadores} arqueros={arqueros} />
        </div>
        <div ref={texto} className="mt-5 opacity-0">
          <p className="marcador text-[2rem] leading-[0.95]">{division.texto}</p>
          <p className="mt-1 text-label text-ink-muted">en {ejercicio}</p>
        </div>
      </div>
    </div>
  );
}

/** Se renderizan una sola vez: después las mueve Flip. */
const Fichas = memo(function Fichas({ jugadores, arqueros }: { jugadores: number; arqueros: number }) {
  const estilo = (x: number, y: number) => ({ left: `${x * 100}%`, top: `${y * 100}%`, width: `${TAM * 100}%`, marginLeft: `${-TAM * 50}%`, marginTop: `${-TAM * 50}%` });
  return (
    <>
      {Array.from({ length: jugadores }, (_, i) => {
        const p = enContador(i);
        return <span key={i} data-flip-id={`j${i}`} data-color="A" className="ficha-flip absolute aspect-square" style={estilo(p.x, p.y)} />;
      })}
      {LUGARES_ARCO.slice(0, arqueros).map((q, i) => {
        const r = rotar(q, "vertical");
        return (
          <span
            key={`k${i}`}
            className="absolute aspect-square rounded-full border-[3px] border-[var(--keeper-edge)] bg-keeper outline outline-2 outline-offset-2 outline-keeper"
            style={estilo((r.x - VB.x) / VB.w, (r.y - VB.y) / VB.h)}
          />
        );
      })}
    </>
  );
});
