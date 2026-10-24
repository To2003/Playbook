import { describe, expect, it } from "vitest";
import { BIBLIOTECA } from "@/data/biblioteca";
import { cajaEnPantalla, encuadreAjustado, longitud, muestrear, recortarFinal, rotar } from "@/lib/pizarra/geometria";

describe("geometría de la pizarra", () => {
  it("una recta se muestrea en sus dos extremos y una curva pasa cerca del control", () => {
    expect(muestrear({ desde: { x: 0, y: 0 }, hasta: { x: 10, y: 0 } })).toHaveLength(2);
    const curva = muestrear({ desde: { x: 0, y: 0 }, hasta: { x: 10, y: 0 }, control: { x: 5, y: 10 } });
    expect(curva[12].y).toBeCloseTo(5, 5);
  });
  it("recortar el final acorta exactamente esos metros", () => {
    const r = recortarFinal([{ x: 0, y: 0 }, { x: 10, y: 0 }], 2);
    expect(longitud(r)).toBeCloseTo(8, 5);
  });
  it("la vista parada lleva el arco derecho arriba", () => {
    expect(rotar({ x: 91.4, y: 27.5 }, "vertical")).toEqual({ x: 27.5, y: 0 });
    expect(cajaEnPantalla({ x: 45.7, y: 0, w: 45.7, h: 55 }, "vertical")).toEqual({ x: 0, y: 0, w: 55, h: 45.7 });
  });
  it("el encuadre ajustado contiene todas las posiciones de todos los pasos", () => {
    for (const e of BIBLIOTECA) {
      const c = encuadreAjustado(e.pizarra, 16 / 9, 2);
      for (const paso of e.pizarra.pasos)
        for (const q of Object.values(paso.posiciones)) {
          expect(q.x, e.id).toBeGreaterThanOrEqual(c.x);
          expect(q.x, e.id).toBeLessThanOrEqual(c.x + c.w);
          expect(q.y, e.id).toBeGreaterThanOrEqual(c.y);
          expect(q.y, e.id).toBeLessThanOrEqual(c.y + c.h);
        }
    }
  });
});
