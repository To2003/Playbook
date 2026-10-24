"use client";

import { gsap } from "@/lib/gsap";
import { bochaQueAcompana, pathRecorrido } from "@/lib/pizarra/geometria";
import type { Pizarra, Punto, Trazo } from "@/lib/tipos";

/** Tiempos del lenguaje de la pizarra, en segundos. */
const DIBUJO = 0.5; // un trazo se dibuja antes de que alguien se mueva
const SOLAPE = 0.32; // el movimiento arranca cuando el trazo está casi completo
const PAUSA_FINAL = 1.2;

const r = (n: number) => Math.round(n * 100) / 100;

/** El mismo recorrido, corrido: la bocha que viaja pegada al palo en una conducción. */
function pathDesplazado(t: Trazo, dx: number, dy: number): string {
  const m = (q: Punto) => ({ x: q.x + dx, y: q.y + dy });
  return pathRecorrido({ desde: m(t.desde), hasta: m(t.hasta), control: t.control && m(t.control) });
}

/**
 * Arma la línea de tiempo de una pizarra sobre su SVG (renderizado en modo `inicio`).
 * Cada paso tiene una etiqueta `p{i}` para saltar entre pasos.
 */
export function construirLinea(svg: SVGSVGElement, pizarra: Pizarra): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });
  const el = (id: string) => svg.querySelector<SVGGElement>(`[data-el="${CSS.escape(id)}"]`);
  const bochas = pizarra.elementos.filter((e) => e.tipo === "bocha").map((e) => e.id);
  const inicio = pizarra.pasos[0].posiciones;

  // Estado inicial: todos en el paso 0 y ningún trazo dibujado.
  const revelas = Array.from(svg.querySelectorAll<SVGPathElement>("[data-revela]"));
  const largos = new Map(revelas.map((pth) => [pth, pth.getTotalLength() + 2]));
  tl.add(() => undefined, 0);
  for (const [id, q] of Object.entries(inicio)) {
    const nodo = el(id);
    if (nodo) tl.set(nodo, { x: q.x, y: q.y }, 0);
  }
  for (const pth of revelas) tl.set(pth, { strokeDasharray: largos.get(pth), strokeDashoffset: largos.get(pth) }, 0);
  tl.set(svg.querySelectorAll("[data-punta]"), { opacity: 0 }, 0);
  tl.set(svg.querySelectorAll("[data-trazo]"), { opacity: 1 }, 0);

  let t = 0;
  pizarra.pasos.forEach((paso, i) => {
    const siguiente = pizarra.pasos[i + 1];
    tl.addLabel(`p${i}`, t);
    if (!siguiente) return;
    const dur = paso.duracionMs / 1000;
    const grupos = Array.from(svg.querySelectorAll<SVGGElement>(`[data-paso="${i}"]`));

    // 1. Se dibujan los trazos del paso.
    grupos.forEach((g) => {
      const rev = g.querySelector<SVGPathElement>("[data-revela]");
      if (rev) tl.to(rev, { strokeDashoffset: 0, duration: DIBUJO, ease: "power1.inOut" }, t);
      tl.to(g.querySelector("[data-punta]"), { opacity: 1, duration: 0.15, ease: "none" }, t + DIBUJO - 0.1);
    });
    const mov = t + (grupos.length ? DIBUJO - SOLAPE + 0.2 : 0);

    // 2. Se mueven: por su trazo si tienen uno; si no, en línea recta.
    const conTrazo = new Set<string>();
    for (const tr of paso.trazos) {
      const nodo = el(tr.elementoId);
      if (!nodo) continue;
      conTrazo.add(tr.elementoId);
      const esBocha = tr.tipo === "pase" || tr.tipo === "tiro";
      // Las personas aceleran y frenan; la bocha sale rápida y se frena con el roce.
      const ease = esBocha ? (tr.tipo === "tiro" ? "power3.out" : "power2.out") : "power2.inOut";
      const d = esBocha ? Math.min(dur, tr.tipo === "tiro" ? 0.55 : 0.9) : dur;
      tl.to(nodo, { motionPath: { path: pathRecorrido(tr) }, duration: d, ease }, mov);
      const acompana = bochaQueAcompana(paso, tr, bochas);
      if (acompana) {
        conTrazo.add(acompana);
        const b = paso.posiciones[acompana];
        const nb = el(acompana);
        if (nb) tl.to(nb, { motionPath: { path: pathDesplazado(tr, b.x - tr.desde.x, b.y - tr.desde.y) }, duration: d, ease }, mov);
      }
    }
    for (const [id, q] of Object.entries(siguiente.posiciones)) {
      if (conTrazo.has(id)) continue;
      const antes = paso.posiciones[id];
      if (!antes || (r(antes.x) === r(q.x) && r(antes.y) === r(q.y))) continue;
      const nodo = el(id);
      if (nodo) tl.to(nodo, { x: q.x, y: q.y, duration: dur, ease: "power2.inOut" }, mov);
    }

    // 3. Los trazos del paso quedan tenues: se ve de dónde vino cada uno.
    t = mov + dur;
    if (grupos.length) tl.to(grupos, { opacity: 0.28, duration: 0.25, ease: "power1.out" }, t);
    t += 0.15;
  });
  tl.addLabel("fin", t);
  // Cierre del loop: se apagan los trazos y todos vuelven a su lugar, sin saltos.
  const vuelta = t + PAUSA_FINAL;
  tl.to(svg.querySelectorAll("[data-trazo]"), { opacity: 0, duration: 0.25, ease: "power1.out" }, vuelta);
  const final = pizarra.pasos[pizarra.pasos.length - 1].posiciones;
  for (const [id, q] of Object.entries(inicio)) {
    const f = final[id];
    const nodo = el(id);
    if (nodo && f && (r(f.x) !== r(q.x) || r(f.y) !== r(q.y))) tl.to(nodo, { x: q.x, y: q.y, duration: 0.6, ease: "power2.inOut" }, vuelta + 0.1);
  }
  tl.to({}, { duration: 0.2 }, vuelta + 0.7);
  return tl;
}

/** Cantidad de pasos navegables (el último es el estado final). */
export const pasosDe = (p: Pizarra) => p.pasos.length;
