"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Cancha, DefsCancha, GROSOR_TIZA } from "@/components/pizarra/Cancha";
import { Ficha } from "@/components/pizarra/Ficha";
import type { Accion } from "@/lib/editor/estado";
import { Draggable, gsap } from "@/lib/gsap";
import { useMovimientoReducido } from "@/lib/hooks/useMovimientoReducido";
import { RADIO_FICHA, ROTACION_VERTICAL, VISTAS, cajaEnPantalla, dibujoTrazo, type Caja, type Orientacion } from "@/lib/pizarra/geometria";
import type { Ejercicio, Elemento, Punto, Trazo } from "@/lib/tipos";

export type Herramienta = "mover" | Trazo["tipo"];

interface Props {
  ejercicio: Ejercicio;
  paso: number;
  orientacion: Orientacion;
  herramienta: Herramienta;
  seleccion: string[];
  onSeleccion: (ids: string[]) => void;
  trazoSel: number | null;
  onTrazoSel: (i: number | null) => void;
  despachar: (a: Accion) => void;
  /** Para soltar elementos arrastrados desde la paleta (HTML drag & drop). */
  onSoltar?: (tipoArrastrado: string, en: Punto) => void;
  className?: string;
}

const capa = (e: Elemento) => (e.tipo === "zona" ? 0 : e.tipo === "bocha" ? 3 : e.tipo === "jugador" || e.tipo === "arquero" ? 2 : 1);

/**
 * Lienzo editable de la pizarra. Las fichas las posiciona GSAP (no React) para que
 * Draggable e Inertia compartan el mismo estado de transform; al soltar se confirma en el reducer.
 */
export function Lienzo({ ejercicio, paso, orientacion, herramienta, seleccion, onSeleccion, trazoSel, onTrazoSel, despachar, onSoltar, className }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const reducido = useMovimientoReducido();
  const contenido = useRef<SVGGElement>(null);
  const pz = ejercicio.pizarra;
  const actual = pz.pasos[paso] ?? pz.pasos[0];
  const anterior = paso > 0 ? pz.pasos[paso - 1] : undefined;
  const rad = RADIO_FICHA[pz.vista];
  const grosor = GROSOR_TIZA[pz.vista];
  const girada = orientacion === "vertical";
  const [vb, setVb] = useState<Caja>(() => cajaEnPantalla(VISTAS[pz.vista], orientacion));
  const [borrador, setBorrador] = useState<{ desde: Punto; hasta: Punto } | null>(null);
  const seleccionRef = useRef(seleccion);
  const posRef = useRef(actual.posiciones);
  useEffect(() => {
    seleccionRef.current = seleccion;
    posRef.current = actual.posiciones;
  });

  // Cambió la vista: se reencuadra (ajuste de estado durante el render, sin efecto).
  const claveVista = `${pz.vista}-${orientacion}`;
  const [vistaPrevia, setVistaPrevia] = useState(claveVista);
  if (vistaPrevia !== claveVista) {
    setVistaPrevia(claveVista);
    setVb(cajaEnPantalla(VISTAS[pz.vista], orientacion));
  }

  /** Pantalla → metros de cancha (tiene en cuenta zoom, paneo y la rotación). */
  const aCancha = (clientX: number, clientY: number): Punto => {
    const g = contenido.current!;
    const m = g.getScreenCTM()!.inverse();
    const pt = new DOMPoint(clientX, clientY).matrixTransform(m);
    return { x: pt.x, y: pt.y };
  };

  // Las fichas toman la posición del paso actual.
  useLayoutEffect(() => {
    const raiz = contenido.current;
    if (!raiz) return;
    for (const [id, q] of Object.entries(actual.posiciones)) {
      const el = raiz.querySelector(`[data-mov="${CSS.escape(id)}"]`);
      if (el) gsap.set(el, { x: q.x, y: q.y });
    }
  });

  // Arrastre con inercia de las fichas (herramienta mover).
  useLayoutEffect(() => {
    const raiz = contenido.current;
    if (!raiz || herramienta !== "mover") return;
    const nodos = Array.from(raiz.querySelectorAll<SVGGElement>("[data-mov]"));
    let inicio: Record<string, Punto> = {};
    const ds = nodos.map((nodo) =>
      Draggable.create(nodo, {
        type: "x,y",
        // Con movimiento reducido la ficha queda donde se suelta, sin deslizar.
        inertia: !reducido,
        bounds: { minX: -2, maxX: 93.4, minY: -2, maxY: 57 },
        throwResistance: 2600,
        zIndexBoost: false,
        onPress(ev: PointerEvent) {
          const id = nodo.dataset.mov!;
          const sel = seleccionRef.current;
          if (ev.shiftKey || ev.metaKey || ev.ctrlKey) onSeleccion(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);
          else if (!sel.includes(id)) onSeleccion([id]);
          onTrazoSel(null);
          inicio = { ...posRef.current };
        },
        onDrag() {
          moverJunto(this.x, this.y, nodo);
        },
        onThrowUpdate() {
          moverJunto(this.x, this.y, nodo);
        },
        onDragEnd() {
          if (!this.tween) confirmar(nodo);
        },
        onThrowComplete() {
          confirmar(nodo);
        },
      })[0],
    );

    // La selección se mueve en bloque con la ficha que se arrastra.
    function moverJunto(x: number, y: number, nodo: SVGGElement) {
      const id = nodo.dataset.mov!;
      const o = inicio[id];
      if (!o) return;
      const dx = x - o.x;
      const dy = y - o.y;
      for (const otro of seleccionRef.current) {
        if (otro === id || !inicio[otro]) continue;
        const el = raiz!.querySelector(`[data-mov="${CSS.escape(otro)}"]`);
        if (el) gsap.set(el, { x: inicio[otro].x + dx, y: inicio[otro].y + dy });
      }
    }
    function confirmar(nodo: SVGGElement) {
      const id = nodo.dataset.mov!;
      const ids = seleccionRef.current.includes(id) ? seleccionRef.current : [id];
      const posiciones: Record<string, Punto> = {};
      for (const x of ids) {
        const el = raiz!.querySelector(`[data-mov="${CSS.escape(x)}"]`);
        if (el) posiciones[x] = { x: Number(gsap.getProperty(el, "x")), y: Number(gsap.getProperty(el, "y")) };
      }
      const cambio = Object.entries(posiciones).some(([k, q]) => !inicio[k] || Math.hypot(q.x - inicio[k].x, q.y - inicio[k].y) > 0.05);
      if (cambio) despachar({ tipo: "mover", paso, posiciones });
    }
    return () => ds.forEach((d) => d.kill());
  }, [herramienta, paso, pz.elementos.length, ejercicio, despachar, onSeleccion, onTrazoSel, reducido]);

  // Dibujar un trazo: desde una ficha hasta donde se suelta.
  const empezarTrazo = (ev: React.PointerEvent, el: Elemento) => {
    if (herramienta === "mover") return;
    ev.stopPropagation();
    ev.preventDefault();
    let id = el.id;
    // Pase y tiro mueven la bocha: si se arrastra desde un jugador, se usa la bocha que tiene pegada.
    if ((herramienta === "pase" || herramienta === "tiro") && el.tipo !== "bocha") {
      const q = actual.posiciones[el.id];
      const cerca = pz.elementos
        .filter((x) => x.tipo === "bocha")
        .map((b) => ({ id: b.id, d: Math.hypot(actual.posiciones[b.id].x - q.x, actual.posiciones[b.id].y - q.y) }))
        .sort((a, b) => a.d - b.d)[0];
      if (!cerca || cerca.d > 4) return;
      id = cerca.id;
    }
    if ((herramienta === "desplazamiento" || herramienta === "conduccion") && el.tipo !== "jugador" && el.tipo !== "arquero") return;
    const desde = actual.posiciones[id];
    (ev.target as Element).setPointerCapture?.(ev.pointerId);
    setBorrador({ desde, hasta: desde });
    const mover = (e: PointerEvent) => setBorrador({ desde, hasta: aCancha(e.clientX, e.clientY) });
    const soltar = (e: PointerEvent) => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
      setBorrador(null);
      const hasta = aCancha(e.clientX, e.clientY);
      if (Math.hypot(hasta.x - desde.x, hasta.y - desde.y) < 1.5) return;
      despachar({ tipo: "trazo", paso, trazo: { tipo: herramienta, elementoId: id, desde, hasta } });
    };
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar);
  };

  // Zoom con la rueda (y pellizco del trackpad) alrededor del puntero.
  const onWheel = (ev: React.WheelEvent) => {
    ev.preventDefault();
    const s = svg.current!;
    const r = s.getBoundingClientRect();
    const fx = (ev.clientX - r.left) / r.width;
    const fy = (ev.clientY - r.top) / r.height;
    const k = Math.exp(ev.deltaY * 0.0015);
    setVb((v) => {
      const base = cajaEnPantalla(VISTAS.completa, orientacion);
      const w = Math.max(12, Math.min(base.w * 1.2, v.w * k));
      const h = (w * v.h) / v.w;
      return { x: v.x + (v.w - w) * fx, y: v.y + (v.h - h) * fy, w, h };
    });
  };

  // Paneo arrastrando el fondo; dos dedos pellizcan.
  const toques = useRef(new Map<number, { x: number; y: number }>());
  const onFondoDown = (ev: React.PointerEvent) => {
    if ((ev.target as Element).closest("[data-mov],[data-trazo-editable],[data-control]")) return;
    onSeleccion([]);
    onTrazoSel(null);
    toques.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    (ev.currentTarget as Element).setPointerCapture(ev.pointerId);
  };
  const onFondoMove = (ev: React.PointerEvent) => {
    const t = toques.current;
    const previo = t.get(ev.pointerId);
    if (!previo) return;
    const r = svg.current!.getBoundingClientRect();
    if (t.size === 1) {
      setVb((v) => ({ ...v, x: v.x - ((ev.clientX - previo.x) / r.width) * v.w, y: v.y - ((ev.clientY - previo.y) / r.height) * v.h }));
    } else if (t.size === 2) {
      const [a, b] = [...t.values()];
      const otro = [...t.entries()].find(([k]) => k !== ev.pointerId)![1];
      const antes = Math.hypot(a.x - b.x, a.y - b.y);
      const ahora = Math.hypot(ev.clientX - otro.x, ev.clientY - otro.y);
      if (antes > 0) {
        const k = antes / ahora;
        setVb((v) => {
          const w = Math.max(12, Math.min(140, v.w * k));
          const h = (w * v.h) / v.w;
          return { x: v.x + (v.w - w) / 2, y: v.y + (v.h - h) / 2, w, h };
        });
      }
    }
    t.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  };
  const onFondoUp = (ev: React.PointerEvent) => {
    toques.current.delete(ev.pointerId);
  };

  const elementos = pz.elementos.filter((e) => actual.posiciones[e.id]).sort((a, b) => capa(a) - capa(b));
  const trazoElegido = trazoSel !== null ? actual.trazos[trazoSel] : undefined;

  return (
    <svg
      ref={svg}
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      className={`touch-none select-none ${className ?? ""}`}
      style={{ display: "block", cursor: herramienta === "mover" ? "default" : "crosshair" }}
      onWheel={onWheel}
      onPointerDown={onFondoDown}
      onPointerMove={onFondoMove}
      onPointerUp={onFondoUp}
      onPointerCancel={onFondoUp}
      onDragOver={(e) => onSoltar && e.preventDefault()}
      onDrop={(e) => {
        const tipo = e.dataTransfer.getData("text/playbook");
        if (tipo && onSoltar) {
          e.preventDefault();
          onSoltar(tipo, aCancha(e.clientX, e.clientY));
        }
      }}
      role="application"
      aria-label="Pizarra editable"
    >
      <DefsCancha />
      <g ref={contenido} transform={girada ? ROTACION_VERTICAL : undefined}>
        <Cancha grosor={grosor} />
        {/* Paso anterior, tenue: de dónde viene cada uno. */}
        {anterior?.trazos.map((t, i) => {
          const { d } = dibujoTrazo(t, rad);
          return <path key={`a${i}`} d={d} fill="none" stroke="var(--chalk)" strokeOpacity={0.25} strokeWidth={grosor * 1.2} strokeDasharray={t.tipo === "pase" ? `${grosor * 2} ${grosor * 2}` : undefined} />;
        })}
        {elementos
          .filter((e) => e.tipo === "zona")
          .map((e) => (
            <g key={e.id} data-mov={e.id} onPointerDown={(ev) => empezarTrazo(ev, e)}>
              <Ficha elemento={e} radio={rad} girada={girada} />
            </g>
          ))}
        {actual.trazos.map((t, i) => {
          const { d, punta } = dibujoTrazo(t, rad);
          const elegido = i === trazoSel;
          return (
            <g
              key={`t${i}`}
              data-trazo-editable
              onPointerDown={(ev) => {
                ev.stopPropagation();
                onTrazoSel(i);
                onSeleccion([]);
              }}
              className="cursor-pointer"
            >
              <path d={d} fill="none" stroke="transparent" strokeWidth={rad * 1.6} />
              <path
                d={d}
                fill="none"
                stroke={elegido ? "var(--lime)" : "var(--chalk)"}
                strokeWidth={t.tipo === "tiro" ? grosor * 3 : grosor * 1.5}
                strokeDasharray={t.tipo === "pase" ? `${grosor * 3.3} ${grosor * 3.6}` : undefined}
                strokeLinecap="round"
              />
              <path d={punta} fill={elegido ? "var(--lime)" : "var(--chalk)"} />
            </g>
          );
        })}
        {elementos
          .filter((e) => e.tipo !== "zona")
          .map((e) => (
            <g key={e.id} data-mov={e.id} onPointerDown={(ev) => empezarTrazo(ev, e)} style={{ cursor: herramienta === "mover" ? "grab" : "crosshair" }}>
              {seleccion.includes(e.id) && <SeleccionAro rad={rad} />}
              <Ficha elemento={e} radio={rad} girada={girada} />
            </g>
          ))}
        {trazoElegido && (
          <ManijaCurva
            trazo={trazoElegido}
            rad={rad}
            aCancha={aCancha}
            onCambio={(control) => despachar({ tipo: "control", paso, indice: trazoSel!, control })}
          />
        )}
        {borrador && (
          <line x1={borrador.desde.x} y1={borrador.desde.y} x2={borrador.hasta.x} y2={borrador.hasta.y} stroke="var(--lime)" strokeWidth={grosor * 1.5} strokeDasharray={`${grosor * 3} ${grosor * 2}`} />
        )}
      </g>
    </svg>
  );
}

function SeleccionAro({ rad }: { rad: number }) {
  return <circle r={rad * 1.9} fill="none" stroke="var(--lime)" strokeWidth={rad * 0.16} strokeDasharray={`${rad * 0.5} ${rad * 0.3}`} pointerEvents="none" />;
}

/** Manija para curvar un trazo (punto de control de la cuadrática). */
function ManijaCurva({ trazo, rad, aCancha, onCambio }: { trazo: Trazo; rad: number; aCancha: (x: number, y: number) => Punto; onCambio: (c?: Punto) => void }) {
  const medio = trazo.control ?? { x: (trazo.desde.x + trazo.hasta.x) / 2, y: (trazo.desde.y + trazo.hasta.y) / 2 };
  const [arrastre, setArrastre] = useState<Punto | null>(null);
  const q = arrastre ?? medio;
  return (
    <circle
      data-control
      cx={q.x}
      cy={q.y}
      r={rad * 0.75}
      fill="var(--lime)"
      stroke="var(--on-lime)"
      strokeWidth={rad * 0.15}
      style={{ cursor: "move" }}
      onPointerDown={(ev) => {
        ev.stopPropagation();
        (ev.target as Element).setPointerCapture(ev.pointerId);
        setArrastre(aCancha(ev.clientX, ev.clientY));
      }}
      onPointerMove={(ev) => arrastre && setArrastre(aCancha(ev.clientX, ev.clientY))}
      onPointerUp={() => {
        if (arrastre) onCambio(arrastre);
        setArrastre(null);
      }}
      onDoubleClick={() => onCambio(undefined)}
    />
  );
}
