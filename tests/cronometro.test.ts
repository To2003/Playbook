import { describe, expect, it } from "vitest";
import { anterior, empezar, mmss, pausar, reanudar, restante, siguiente } from "@/lib/cancha/cronometro";
import type { ItemSesion } from "@/lib/tipos";

const items: ItemSesion[] = [
  { id: "a", bloque: 1, fase: "calor_sin_bocha", minutos: 10, ejercicioId: "x", division: { partes: [1], comodines: 0, rotan: 0, estaciones: 1, texto: "" } },
  { id: "p", pausa: true, minutos: 2 },
  { id: "b", bloque: 3, fase: "principal", minutos: 15, ejercicioId: "y", division: { partes: [1], comodines: 0, rotan: 0, estaciones: 1, texto: "" } },
];

describe("cronómetro del modo cancha", () => {
  it("cuenta contra el reloj aunque pase tiempo sin ticks", () => {
    const e = empezar(items, 1000);
    expect(restante(e, 1000)).toBe(600_000);
    expect(restante(e, 1000 + 7 * 60_000)).toBe(180_000);
    expect(restante(e, 1000 + 99 * 60_000)).toBe(0);
  });
  it("pausa y reanuda sin perder ni ganar tiempo", () => {
    let e = empezar(items, 0);
    e = pausar(e, 60_000);
    expect(restante(e, 500_000)).toBe(540_000);
    e = reanudar(e, 500_000);
    expect(restante(e, 560_000)).toBe(480_000);
  });
  it("pasa por la hidratación y termina", () => {
    let e = empezar(items, 0);
    e = siguiente(e, items, 10);
    expect(e.indice).toBe(1);
    expect(restante(e, 10)).toBe(120_000);
    e = siguiente(siguiente(e, items, 20), items, 30);
    expect(e.completa).toBe(true);
    expect(anterior(empezar(items, 0, 2), items, 0).indice).toBe(1);
  });
  it("formatea mm:ss redondeando para arriba", () => {
    expect(mmss(600_000)).toBe("10:00");
    expect(mmss(461_200)).toBe("07:42");
    expect(mmss(1)).toBe("00:01");
    expect(mmss(0)).toBe("00:00");
  });
});
