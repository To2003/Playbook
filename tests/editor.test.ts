import { describe, expect, it } from "vitest";
import { aplicar, conHistorial, ejercicioVacio, type Historial } from "@/lib/editor/estado";
import { validarEjercicio } from "@/lib/validador";
import type { Elemento } from "@/lib/tipos";

const jug = (id: string): Elemento => ({ id, tipo: "jugador", equipo: "A", etiqueta: id });

describe("editor: reducer", () => {
  it("agregar un elemento le da posición en todos los pasos", () => {
    let e = ejercicioVacio("x", "local");
    e = aplicar(e, { tipo: "agregarPaso", despuesDe: 0 });
    e = aplicar(e, { tipo: "agregar", elemento: jug("a1"), en: { x: 60, y: 20 } });
    expect(e.pizarra.pasos.every((p) => p.posiciones.a1)).toBe(true);
  });

  it("un trazo en el último paso crea el siguiente y lleva al elemento a destino", () => {
    let e = ejercicioVacio("x", "local");
    e = aplicar(e, { tipo: "agregar", elemento: jug("a1"), en: { x: 60, y: 20 } });
    e = aplicar(e, { tipo: "trazo", paso: 0, trazo: { tipo: "desplazamiento", elementoId: "a1", desde: { x: 0, y: 0 }, hasta: { x: 70, y: 25 } } });
    expect(e.pizarra.pasos).toHaveLength(2);
    expect(e.pizarra.pasos[0].trazos[0].desde).toEqual({ x: 60, y: 20 });
    expect(e.pizarra.pasos[1].posiciones.a1).toEqual({ x: 70, y: 25 });
  });

  it("en una conducción la bocha pegada viaja con el jugador", () => {
    let e = ejercicioVacio("x", "local");
    e = aplicar(e, { tipo: "agregar", elemento: jug("a1"), en: { x: 60, y: 20 } });
    e = aplicar(e, { tipo: "agregar", elemento: { id: "o", tipo: "bocha" }, en: { x: 61.4, y: 20.8 } });
    e = aplicar(e, { tipo: "trazo", paso: 0, trazo: { tipo: "conduccion", elementoId: "a1", desde: { x: 0, y: 0 }, hasta: { x: 70, y: 20 } } });
    expect(e.pizarra.pasos[1].posiciones.o).toEqual({ x: 71.4, y: 20.8 });
  });

  it("mover en un paso arrastra a los pasos siguientes que no lo movieron y ajusta el trazo que lo trajo", () => {
    let e = ejercicioVacio("x", "local");
    e = aplicar(e, { tipo: "agregar", elemento: jug("a1"), en: { x: 60, y: 20 } });
    e = aplicar(e, { tipo: "agregar", elemento: jug("a2"), en: { x: 50, y: 20 } });
    e = aplicar(e, { tipo: "trazo", paso: 0, trazo: { tipo: "desplazamiento", elementoId: "a1", desde: { x: 0, y: 0 }, hasta: { x: 70, y: 25 } } });
    e = aplicar(e, { tipo: "mover", paso: 0, posiciones: { a2: { x: 52, y: 30 } } });
    expect(e.pizarra.pasos[1].posiciones.a2).toEqual({ x: 52, y: 30 });
    e = aplicar(e, { tipo: "mover", paso: 1, posiciones: { a1: { x: 72, y: 26 } } });
    expect(e.pizarra.pasos[0].trazos[0].hasta).toEqual({ x: 72, y: 26 });
  });

  it("alinear deja la misma coordenada y duplicar copia corrido", () => {
    let e = ejercicioVacio("x", "local");
    e = aplicar(e, { tipo: "agregar", elemento: jug("a1"), en: { x: 60, y: 20 } });
    e = aplicar(e, { tipo: "agregar", elemento: jug("a2"), en: { x: 64, y: 30 } });
    e = aplicar(e, { tipo: "alinear", ids: ["a1", "a2"], paso: 0, eje: "x" });
    expect(e.pizarra.pasos[0].posiciones.a1.x).toBe(e.pizarra.pasos[0].posiciones.a2.x);
    e = aplicar(e, { tipo: "duplicar", ids: ["a1"], paso: 0, nuevosIds: ["a3"] });
    expect(e.pizarra.pasos[0].posiciones.a3).toEqual({ x: 64, y: 22 });
  });

  it("pasos: agregar, duplicar, reordenar, borrar y duración; nunca más de 12 ni trazos en el último", () => {
    let e = ejercicioVacio("x", "local");
    e = aplicar(e, { tipo: "agregar", elemento: jug("a1"), en: { x: 60, y: 20 } });
    for (let i = 0; i < 15; i++) e = aplicar(e, { tipo: "agregarPaso", despuesDe: e.pizarra.pasos.length - 1 });
    expect(e.pizarra.pasos).toHaveLength(12);
    e = aplicar(e, { tipo: "borrarPaso", paso: 11 });
    e = aplicar(e, { tipo: "duracionPaso", paso: 0, ms: 50 });
    expect(e.pizarra.pasos[0].duracionMs).toBe(300);
    e = aplicar(e, { tipo: "trazo", paso: 0, trazo: { tipo: "desplazamiento", elementoId: "a1", desde: { x: 0, y: 0 }, hasta: { x: 70, y: 25 } } });
    e = aplicar(e, { tipo: "moverPaso", desde: 0, hasta: 10 });
    expect(e.pizarra.pasos[10].trazos).toHaveLength(0);
  });

  it("un ejercicio armado en el editor pasa el validador de propios", () => {
    let e = ejercicioVacio("x", "local");
    e = aplicar(e, { tipo: "ficha", cambios: { nombre: "Rondo del profe" } });
    e = aplicar(e, { tipo: "agregar", elemento: jug("a1"), en: { x: 60, y: 20 } });
    e = aplicar(e, { tipo: "trazo", paso: 0, trazo: { tipo: "desplazamiento", elementoId: "a1", desde: { x: 0, y: 0 }, hasta: { x: 70, y: 25 } } });
    expect(validarEjercicio(e, { base: false })).toEqual([]);
  });
});

describe("editor: historial", () => {
  it("deshace y rehace", () => {
    let h: Historial = { pasado: [], presente: ejercicioVacio("x", "local"), futuro: [] };
    h = conHistorial(h, { tipo: "agregar", elemento: jug("a1"), en: { x: 60, y: 20 } });
    h = conHistorial(h, { tipo: "agregar", elemento: jug("a2"), en: { x: 62, y: 20 } });
    h = conHistorial(h, { tipo: "deshacer" });
    expect(h.presente.pizarra.elementos.map((x) => x.id)).toEqual(["a1"]);
    h = conHistorial(h, { tipo: "rehacer" });
    expect(h.presente.pizarra.elementos.map((x) => x.id)).toEqual(["a1", "a2"]);
  });
});

describe("editor: elemento", () => {
  it("cambia la etiqueta y el tamaño sin tocar las posiciones", () => {
    let e = ejercicioVacio("x", "local");
    e = aplicar(e, { tipo: "agregar", elemento: { id: "z1", tipo: "zona", tam: { w: 12, h: 10 } }, en: { x: 40, y: 20 } });
    e = aplicar(e, { tipo: "elemento", id: "z1", cambios: { tam: { w: 20, h: 8 }, etiqueta: "Zona 1" } });
    expect(e.pizarra.elementos[0]).toMatchObject({ tam: { w: 20, h: 8 }, etiqueta: "Zona 1" });
    expect(e.pizarra.pasos[0].posiciones.z1).toEqual({ x: 40, y: 20 });
  });
});

describe("editor: listo o borrador", () => {
  it("un ejercicio vacío no está listo y dice qué falta", async () => {
    const { faltantesParaListo } = await import("@/lib/editor/useEditor");
    const e = ejercicioVacio("x", "local");
    expect(faltantesParaListo(e)).toEqual(["Ponele un nombre.", "Escribí la consigna.", "Poné al menos una ficha en la cancha."]);
    let l = aplicar(e, { tipo: "ficha", cambios: { nombre: "Rondo", consigna: "Pasen" } });
    l = aplicar(l, { tipo: "agregar", elemento: jug("a1"), en: { x: 60, y: 20 } });
    expect(faltantesParaListo(l)).toEqual([]);
  });
});

describe("editor: ids y flechas", () => {
  it("las copias usan el primer id libre del mismo prefijo", async () => {
    const { idsLibres } = await import("@/lib/editor/ids");
    expect(idsLibres(["a1", "a2"], ["a1", "a2", "a3"])).toEqual(["a4", "a5"]);
    expect(idsLibres(["o"], ["o"])).toEqual(["o1"]);
  });
  it("en la vista parada, la flecha derecha mueve hacia +y de la cancha y la de abajo hacia −x", async () => {
    const { corrimiento } = await import("@/lib/editor/ids");
    expect(corrimiento("ArrowRight", 1, true)).toEqual({ dx: -0, dy: 1 });
    expect(corrimiento("ArrowDown", 1, true)).toEqual({ dx: -1, dy: 0 });
    expect(corrimiento("ArrowDown", 2, false)).toEqual({ dx: 0, dy: 2 });
    expect(corrimiento("a", 1, false)).toBeNull();
  });
});
